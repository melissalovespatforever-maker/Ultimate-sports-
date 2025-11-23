// ============================================
// PERFORMANCE MONITORING UTILITY
// Debug and optimize app performance
// ============================================

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoads: [],
            navigations: [],
            chartRenders: [],
            memorySnapshots: []
        };
        this.isMonitoring = false;
    }

    // Start monitoring
    start() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        console.log('📊 Performance monitoring started');

        // Monitor navigation timing
        this.monitorPageLoad();
        
        // Monitor memory usage
        this.monitorMemory();
        
        // Monitor long tasks
        this.monitorLongTasks();
    }

    // Stop monitoring
    stop() {
        this.isMonitoring = false;
        console.log('📊 Performance monitoring stopped');
    }

    // Monitor page load performance
    monitorPageLoad() {
        if (!performance || !performance.getEntriesByType) return;

        const navTiming = performance.getEntriesByType('navigation')[0];
        if (!navTiming) return;

        const metrics = {
            timestamp: new Date().toISOString(),
            dns: Math.round(navTiming.domainLookupEnd - navTiming.domainLookupStart),
            tcp: Math.round(navTiming.connectEnd - navTiming.connectStart),
            request: Math.round(navTiming.responseStart - navTiming.requestStart),
            response: Math.round(navTiming.responseEnd - navTiming.responseStart),
            domParsing: Math.round(navTiming.domInteractive - navTiming.responseEnd),
            domContentLoaded: Math.round(navTiming.domContentLoadedEventEnd - navTiming.fetchStart),
            loadComplete: Math.round(navTiming.loadEventEnd - navTiming.fetchStart),
            total: Math.round(navTiming.loadEventEnd - navTiming.fetchStart)
        };

        this.metrics.pageLoads.push(metrics);

        console.log('🚀 Page Load Metrics:');
        console.table(metrics);
    }

    // Monitor memory usage
    monitorMemory() {
        if (!performance.memory) {
            console.warn('⚠️ Memory monitoring not supported in this browser');
            return;
        }

        const takeSnapshot = () => {
            if (!this.isMonitoring) return;

            const memory = {
                timestamp: new Date().toISOString(),
                usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
                totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
                jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
            };

            this.metrics.memorySnapshots.push(memory);

            // Check for memory leaks (growing heap)
            if (this.metrics.memorySnapshots.length >= 5) {
                const recent = this.metrics.memorySnapshots.slice(-5);
                const trend = recent[4].usedJSHeapSize - recent[0].usedJSHeapSize;
                
                if (trend > 10) { // More than 10MB growth
                    console.warn('⚠️ Potential memory leak detected!', {
                        growth: `+${trend}MB`,
                        currentUsage: `${memory.usedJSHeapSize}MB`
                    });
                }
            }

            setTimeout(takeSnapshot, 5000); // Every 5 seconds
        };

        takeSnapshot();
    }

    // Monitor long tasks (>50ms)
    monitorLongTasks() {
        if (!PerformanceObserver) return;

        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) {
                        console.warn('⚠️ Long task detected:', {
                            duration: Math.round(entry.duration) + 'ms',
                            startTime: Math.round(entry.startTime) + 'ms',
                            name: entry.name
                        });
                    }
                }
            });

            observer.observe({ entryTypes: ['longtask', 'measure'] });
        } catch (error) {
            console.warn('Long task monitoring not supported');
        }
    }

    // Track navigation between pages
    trackNavigation(fromPage, toPage) {
        const start = performance.now();
        
        return () => {
            const duration = performance.now() - start;
            
            const nav = {
                timestamp: new Date().toISOString(),
                from: fromPage,
                to: toPage,
                duration: Math.round(duration)
            };

            this.metrics.navigations.push(nav);

            if (duration > 300) {
                console.warn('⚠️ Slow navigation:', nav);
            } else {
                console.log('✅ Navigation:', `${fromPage} → ${toPage} (${Math.round(duration)}ms)`);
            }
        };
    }

    // Track chart render time
    trackChartRender(chartName) {
        const start = performance.now();
        
        return () => {
            const duration = performance.now() - start;
            
            const render = {
                timestamp: new Date().toISOString(),
                chart: chartName,
                duration: Math.round(duration)
            };

            this.metrics.chartRenders.push(render);

            if (duration > 200) {
                console.warn('⚠️ Slow chart render:', render);
            } else {
                console.log('✅ Chart rendered:', `${chartName} (${Math.round(duration)}ms)`);
            }
        };
    }

    // Get performance report
    getReport() {
        return {
            summary: this.getSummary(),
            pageLoads: this.metrics.pageLoads,
            navigations: this.metrics.navigations,
            chartRenders: this.metrics.chartRenders,
            memory: this.getMemorySummary()
        };
    }

    // Get summary statistics
    getSummary() {
        return {
            totalNavigations: this.metrics.navigations.length,
            avgNavigationTime: this.average(this.metrics.navigations.map(n => n.duration)),
            totalChartRenders: this.metrics.chartRenders.length,
            avgChartRenderTime: this.average(this.metrics.chartRenders.map(c => c.duration)),
            slowNavigations: this.metrics.navigations.filter(n => n.duration > 300).length,
            slowChartRenders: this.metrics.chartRenders.filter(c => c.duration > 200).length
        };
    }

    // Get memory usage summary
    getMemorySummary() {
        if (this.metrics.memorySnapshots.length === 0) {
            return { status: 'No data' };
        }

        const latest = this.metrics.memorySnapshots[this.metrics.memorySnapshots.length - 1];
        const oldest = this.metrics.memorySnapshots[0];

        return {
            currentUsage: `${latest.usedJSHeapSize}MB`,
            heapLimit: `${latest.jsHeapSizeLimit}MB`,
            utilizationPercent: Math.round((latest.usedJSHeapSize / latest.jsHeapSizeLimit) * 100),
            growthSinceStart: `${latest.usedJSHeapSize - oldest.usedJSHeapSize}MB`,
            snapshotCount: this.metrics.memorySnapshots.length
        };
    }

    // Helper: Calculate average
    average(arr) {
        if (arr.length === 0) return 0;
        return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    }

    // Print full report
    printReport() {
        console.log('\n📊 ======= PERFORMANCE REPORT =======');
        console.log('\n📈 Summary:');
        console.table(this.getSummary());
        
        if (this.metrics.pageLoads.length > 0) {
            console.log('\n🚀 Page Loads:');
            console.table(this.metrics.pageLoads);
        }
        
        if (this.metrics.navigations.length > 0) {
            console.log('\n🔄 Recent Navigations:');
            console.table(this.metrics.navigations.slice(-10));
        }
        
        if (this.metrics.chartRenders.length > 0) {
            console.log('\n📊 Chart Renders:');
            console.table(this.metrics.chartRenders.slice(-10));
        }
        
        console.log('\n💾 Memory:');
        console.table([this.getMemorySummary()]);
        
        console.log('\n=====================================\n');
    }

    // Export report as JSON
    exportReport() {
        const report = this.getReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('📥 Performance report exported');
    }

    // Clear all metrics
    clear() {
        this.metrics = {
            pageLoads: [],
            navigations: [],
            chartRenders: [],
            memorySnapshots: []
        };
        console.log('🧹 Performance metrics cleared');
    }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-start in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    performanceMonitor.start();
    
    // Make it globally accessible for console debugging
    window.perfMonitor = performanceMonitor;
    
    console.log('💡 Performance monitor active. Use window.perfMonitor for controls:');
    console.log('   perfMonitor.printReport() - View current metrics');
    console.log('   perfMonitor.exportReport() - Download JSON report');
    console.log('   perfMonitor.clear() - Clear metrics');
    console.log('   perfMonitor.stop() - Stop monitoring');
}
