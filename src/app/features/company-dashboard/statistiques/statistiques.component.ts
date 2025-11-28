import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { StatisticsService, Statistics, Performance, StatisticsResponse } from '../../../core/services/company/statistics.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statistiques.component.html',
  styleUrls: ['./statistiques.component.scss']
})
export class StatistiquesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  stats: Statistics = {
    commandesTotales: 0,
    commandesLivrees: 0,
    commandesAnnulees: 0,
    livreursActifs: 0,
    percentageChangeTotales: '+0%',
    percentageChangeLivrees: '+0%',
    percentageChangeAnnulees: '+0%',
    percentageChangeLivreurs: '+0%',
    monthlyData: [],
    statusDistribution: []
  };

  performanceData: Performance = {
    livraisonsMoyennes: '0',
    tempsMoyen: '0 min',
    tauxSatisfaction: '0%',
    revenusTotaux: '0 dt',
    zonesActives: 'None'
  };

  selectedPeriod: string = '7 days';
  selectedYear: string = '2025';
  loading: boolean = false;
  error: string = '';

  private barChart: Chart | null = null;
  private donutChart: Chart | null = null;
  private chartsReady = false;

  constructor(
    private statisticsService: StatisticsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Charger les données immédiatement - comme le Livreur Dashboard
    this.loadAllData();

    // Écouter NavigationEnd pour recharger lors des navigations
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        if (event.url.includes('/statistiques')) {
          this.loadAllData();
        }
      });
  }

  private loadAllData() {
    this.loadStatistics();
    this.loadPerformanceData();
  }

  loadStatistics() {
    this.loading = true;
    this.error = '';

    this.statisticsService.getStatistics().subscribe({
      next: (response: StatisticsResponse) => {
        console.log('📊 Statistics received:', response);
        if (response.success && response.statistics) {
          this.stats = response.statistics;
          this.chartsReady = true;
          
          // Utiliser requestAnimationFrame pour s'assurer que le DOM est prêt
          setTimeout(() => {
            this.createAllCharts();
          }, 100);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error loading statistics:', err);
        this.error = 'Error loading statistics';
        this.loading = false;
      }
    });
  }

  loadPerformanceData() {
    this.statisticsService.getPerformanceData().subscribe({
      next: (response: StatisticsResponse) => {
        console.log('🎯 Performance data received:', response);
        if (response.success && response.performance) {
          this.performanceData = response.performance;
        }
      },
      error: (err) => {
        console.error('❌ Error loading performance:', err);
      }
    });
  }

  createAllCharts() {
    console.log('🎨 Creating all charts...');
    this.createBarChart();
    this.createDonutChart();
  }

  createBarChart() {
    const canvas = document.getElementById('barChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('❌ Canvas #barChart not found in DOM');
      return;
    }

    if (this.barChart) {
      this.barChart.destroy();
      this.barChart = null;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ Cannot get 2D context for barChart');
      return;
    }

    const labels = this.stats.monthlyData && this.stats.monthlyData.length > 0
      ? this.stats.monthlyData.map(d => d.month)
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    const totals = this.stats.monthlyData && this.stats.monthlyData.length > 0
      ? this.stats.monthlyData.map(d => d.total)
      : [220, 350, 280, 450, 380, 520];
    
    const delivered = this.stats.monthlyData && this.stats.monthlyData.length > 0
      ? this.stats.monthlyData.map(d => d.delivered)
      : [200, 320, 260, 420, 350, 480];

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Total Orders',
            data: totals,
            backgroundColor: '#8b5cf6',
            borderRadius: 8
          },
          {
            label: 'Delivered Orders',
            data: delivered,
            backgroundColor: '#ec4899',
            borderRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: { size: 12, weight: 'bold' }
            }
          },
          title: {
            display: true,
            text: 'ORDERS BY MONTH',
            align: 'start',
            font: { size: 14, weight: 'bold' },
            color: '#475569',
            padding: { bottom: 20 }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { display: true, color: '#f1f5f9' },
            border: { display: false },
            ticks: { font: { size: 11 }, color: '#64748b' }
          },
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { font: { size: 11 }, color: '#64748b' }
          }
        }
      }
    });

    console.log('✅ Bar chart created successfully');
  }

  createDonutChart() {
    const canvas = document.getElementById('donutChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('❌ Canvas #donutChart not found in DOM');
      return;
    }

    if (this.donutChart) {
      this.donutChart.destroy();
      this.donutChart = null;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ Cannot get 2D context for donutChart');
      return;
    }

    const labels = this.stats.statusDistribution && this.stats.statusDistribution.length > 0
      ? this.stats.statusDistribution.map(d => this.getStatusLabel(d.status))
      : ['Delivered', 'Pending', 'Cancelled'];
    
    const data = this.stats.statusDistribution && this.stats.statusDistribution.length > 0
      ? this.stats.statusDistribution.map(d => d.count)
      : [40, 32, 28];

    this.donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#10b981', '#fbbf24', '#ef4444', '#8b5cf6', '#ec4899'],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: { size: 12 }
            }
          },
          title: {
            display: true,
            text: 'Distribution by Status',
            align: 'start',
            font: { size: 14, weight: 'bold' },
            color: '#475569',
            padding: { top: 10, bottom: 20 }
          }
        },
        cutout: '70%' as any
      }
    });

    console.log('✅ Donut chart created successfully');
  }

  getStatusLabel(status: string): string {
    const labelMap: { [key: string]: string } = {
      'pending': 'Pending',
      'accepted': 'Accepted',
      'in_transit': 'In Transit',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'returned': 'Returned'
    };
    return labelMap[status] || status;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.barChart) this.barChart.destroy();
    if (this.donutChart) this.donutChart.destroy();
  }
}
