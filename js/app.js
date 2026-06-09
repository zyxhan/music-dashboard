/* ============================================
   Music Dashboard - 交互增强版
   新增功能：
   1. KPI数字滚动计数动画
   2. Intersection Observer 滚动渐显
   3. 专辑封面墙（CSS渐变艺术封面）
   4. 图表主题统一为极简暗色
   ============================================ */

const musicData = {
    hourlyDistribution: [
        5, 3, 2, 1, 1, 2,
        8, 15, 20, 18, 12, 10,
        25, 30, 28, 22, 20, 18,
        35, 40, 38, 30, 20, 12, 8, 6
    ],
    topArtists: [
        { name: '周杰伦', count: 328, color: ['#667eea', '#764ba2'] },
        { name: '林俊杰', count: 256, color: ['#f093fb', '#f5576c'] },
        { name: '陈奕迅', count: 198, color: ['#4facfe', '#00f2fe'] },
        { name: '薛之谦', count: 175, color: ['#43e97b', '#38f9d7'] },
        { name: '毛不易', count: 142, color: ['#fa709a', '#fee140'] },
        { name: '邓紫棋', count: 128, color: ['#a8edea', '#fed6e3'] },
        { name: '李荣浩', count: 115, color: ['#ff9a9e', '#fecfef'] },
        { name: '许嵩', count: 98, color: ['#ffecd2', '#fcb69f'] },
        { name: '五月天', count: 87, color: ['#667eea', '#764ba2'] },
        { name: 'Taylor Swift', count: 76, color: ['#f093fb', '#f5576c'] }
    ],
    genreDistribution: [
        { value: 35, name: '流行' },
        { value: 20, name: '摇滚' },
        { value: 15, name: '民谣' },
        { value: 12, name: 'R&B' },
        { value: 10, name: '电子' },
        { value: 8, name: '嘻哈' }
    ],
    monthlyTrend: [180, 165, 210, 195, 230, 250, 280, 260, 220, 200, 240, 270],
    musicProfile: {
        indicators: [
            { name: '节奏感', max: 100 },
            { name: '情感深度', max: 100 },
            { name: '旋律性', max: 100 },
            { name: '歌词质量', max: 100 },
            { name: '耐听度', max: 100 },
            { name: '创新性', max: 100 }
        ],
        values: [75, 85, 90, 80, 88, 65]
    }
};

/* ============================================
   1. KPI 数字滚动计数动画
   从0平滑滚动到目标值
   ============================================ */
function animateCounter(el, target, duration = 2000) {
    const start = performance.now();
    const startVal = 0;
    
    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutQuart 缓动函数，先快后慢
        const ease = 1 - Math.pow(1 - progress, 4);
        const current = Math.round(startVal + (target - startVal) * ease);
        el.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function initCounters() {
    const counters = document.querySelectorAll('.kpi-number');
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.target);
        animateCounter(counter, target);
    });
}

/* ============================================
   2. Intersection Observer 滚动渐显
   元素进入视口时添加 visible 类触发CSS动画
   ============================================ */
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 根据 data-delay 延迟显示，创造错落感
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
}

/* ============================================
   3. 专辑封面墙渲染
   用CSS线性渐变生成每个歌手的专属艺术封面
   ============================================ */
function renderAlbumWall() {
    const container = document.getElementById('album-wall');
    const artists = musicData.topArtists.slice(0, 10);
    
    artists.forEach((artist, index) => {
        const item = document.createElement('div');
        item.className = 'album-item reveal';
        item.dataset.delay = index * 80; // 依次延迟80ms
        
        // 生成渐变角度（每个封面角度不同）
        const angle = 135 + (index * 25) % 180;
        const gradient = `linear-gradient(${angle}deg, ${artist.color[0]}, ${artist.color[1]})`;
        
        // 添加一些装饰性噪点纹理（用SVG data URI）
        const noise = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`;
        
        item.innerHTML = `
            <div class="album-cover" style="background-image: ${gradient}, ${noise}; background-blend-mode: overlay;"></div>
            <div class="album-overlay">
                <div class="album-artist">${artist.name}</div>
                <div class="album-plays">${artist.count.toLocaleString()} 次播放</div>
            </div>
        `;
        
        container.appendChild(item);
    });
    
    // 新添加的 album-item 也需要被Observer监视
    document.querySelectorAll('.album-item.reveal').forEach(el => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, parseInt(delay));
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        observer.observe(el);
    });
}

/* ============================================
   4. ECharts 图表初始化
   统一暗色主题，更克制的配色
   ============================================ */
const chartTheme = {
    textStyle: { fontFamily: '-apple-system, sans-serif' },
    tooltip: {
        backgroundColor: 'rgba(10, 10, 15, 0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        textStyle: { color: '#f0f0f5', fontSize: 12 },
        padding: [12, 16]
    }
};

function initHoursChart() {
    const chart = echarts.init(document.getElementById('chart-hours'));
    chart.setOption({
        ...chartTheme,
        grid: { top: 10, right: 10, bottom: 30, left: 40 },
        xAxis: {
            type: 'category',
            data: Array.from({length: 24}, (_, i) => `${i}:00`),
            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
            axisLabel: { color: '#5a5a6a', fontSize: 10 }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.03)' } },
            axisLabel: { color: '#5a5a6a' }
        },
        series: [{
            data: musicData.hourlyDistribution,
            type: 'bar',
            barWidth: '60%',
            itemStyle: {
                borderRadius: [4, 4, 0, 0],
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#c8a8ff' },
                    { offset: 1, color: 'rgba(200, 168, 255, 0.1)' }
                ])
            },
            emphasis: {
                itemStyle: { color: '#fff' }
            }
        }]
    });
    return chart;
}

function initArtistsChart() {
    const chart = echarts.init(document.getElementById('chart-artists'));
    const names = musicData.topArtists.map(a => a.name).reverse();
    const counts = musicData.topArtists.map(a => a.count).reverse();
    
    chart.setOption({
        ...chartTheme,
        grid: { top: 10, right: 40, bottom: 10, left: 80 },
        xAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.03)' } },
            axisLabel: { color: '#5a5a6a' }
        },
        yAxis: {
            type: 'category',
            data: names,
            axisLine: { show: false },
            axisLabel: { color: '#8a8a9a', fontSize: 11 }
        },
        series: [{
            type: 'bar',
            data: counts,
            barWidth: 12,
            itemStyle: {
                borderRadius: [0, 6, 6, 0],
                color: '#c8a8ff'
            },
            label: {
                show: true,
                position: 'right',
                color: '#5a5a6a',
                fontSize: 10
            }
        }]
    });
    return chart;
}

function initGenresChart() {
    const chart = echarts.init(document.getElementById('chart-genres'));
    chart.setOption({
        ...chartTheme,
        legend: {
            bottom: 0,
            textStyle: { color: '#5a5a6a', fontSize: 10 },
            itemWidth: 10,
            itemHeight: 10,
            itemGap: 16
        },
        series: [{
            type: 'pie',
            radius: ['45%', '75%'],
            center: ['50%', '42%'],
            avoidLabelOverlap: true,
            itemStyle: {
                borderRadius: 6,
                borderColor: '#0a0a0f',
                borderWidth: 3
            },
            label: {
                show: true,
                color: '#8a8a9a',
                fontSize: 10,
                formatter: '{b}\n{d}%'
            },
            labelLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
            data: musicData.genreDistribution,
            color: ['#c8a8ff', '#a8d8ff', '#ffd6a8', '#a8ffd6', '#ffa8d6', '#d6a8ff']
        }]
    });
    return chart;
}

function initMonthlyChart() {
    const chart = echarts.init(document.getElementById('chart-monthly'));
    chart.setOption({
        ...chartTheme,
        grid: { top: 30, right: 20, bottom: 30, left: 50 },
        xAxis: {
            type: 'category',
            data: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
            axisLabel: { color: '#5a5a6a', fontSize: 10 }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.03)' } },
            axisLabel: { color: '#5a5a6a' }
        },
        series: [{
            data: musicData.monthlyTrend,
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { color: '#c8a8ff', width: 2 },
            itemStyle: { color: '#c8a8ff', borderColor: '#0a0a0f', borderWidth: 2 },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(200, 168, 255, 0.25)' },
                    { offset: 1, color: 'rgba(200, 168, 255, 0)' }
                ])
            }
        }]
    });
    return chart;
}

function initRadarChart() {
    const chart = echarts.init(document.getElementById('chart-radar'));
    chart.setOption({
        ...chartTheme,
        radar: {
            indicator: musicData.musicProfile.indicators,
            shape: 'polygon',
            center: ['50%', '52%'],
            radius: '58%',
            axisName: { color: '#8a8a9a', fontSize: 11 },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
            splitArea: {
                areaStyle: {
                    color: ['rgba(200,168,255,0.02)', 'rgba(200,168,255,0.05)']
                }
            },
            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
        },
        series: [{
            type: 'radar',
            data: [{
                value: musicData.musicProfile.values,
                name: '偏好',
                areaStyle: { color: 'rgba(200, 168, 255, 0.2)' },
                lineStyle: { color: '#c8a8ff', width: 2 },
                itemStyle: { color: '#c8a8ff' }
            }]
        }]
    });
    return chart;
}

function initHeatmapChart() {
    const chart = echarts.init(document.getElementById('chart-heatmap'));
    const hours = Array.from({length: 24}, (_, i) => `${i}h`);
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const heatData = [];
    
    for (let d = 0; d < 7; d++) {
        for (let h = 0; h < 24; h++) {
            let value;
            if (d < 5) {
                value = (h >= 8 && h <= 22) ? Math.random() * 80 + 20 : Math.random() * 15;
            } else {
                value = (h >= 10 && h <= 24) ? Math.random() * 90 + 10 : Math.random() * 25;
            }
            heatData.push([h, d, Math.round(value)]);
        }
    }
    
    chart.setOption({
        ...chartTheme,
        tooltip: {
            ...chartTheme.tooltip,
            formatter: (p) => `${days[p.value[1]]} ${hours[p.value[0]]}<br/>活跃度: ${p.value[2]}`
        },
        grid: { top: 10, right: 10, bottom: 50, left: 50 },
        xAxis: {
            type: 'category',
            data: hours,
            splitArea: { show: false },
            axisLabel: { color: '#5a5a6a', fontSize: 9, interval: 3 }
        },
        yAxis: {
            type: 'category',
            data: days,
            splitArea: { show: false },
            axisLabel: { color: '#8a8a9a', fontSize: 10 }
        },
        visualMap: {
            min: 0,
            max: 100,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: 0,
            textStyle: { color: '#5a5a6a', fontSize: 10 },
            itemWidth: 12,
            itemHeight: 100,
            inRange: {
                color: ['#0a0a0f', '#1a1525', '#2d1f4a', '#5a3d8a', '#8b6bc7', '#c8a8ff']
            }
        },
        series: [{
            type: 'heatmap',
            data: heatData,
            itemStyle: {
                borderColor: '#0a0a0f',
                borderWidth: 2,
                borderRadius: 3
            },
            emphasis: {
                itemStyle: { shadowBlur: 10, shadowColor: 'rgba(200, 168, 255, 0.4)' }
            }
        }]
    });
    return chart;
}

/* ============================================
   页面初始化
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    // 1. 滚动渐显
    initScrollReveal();
    
    // 2. KPI数字动画（延迟300ms等页面入场后再开始）
    setTimeout(initCounters, 300);
    
    // 3. 渲染专辑封面墙
    renderAlbumWall();
    
    // 4. 初始化图表
    const charts = [
        initHoursChart(),
        initArtistsChart(),
        initGenresChart(),
        initMonthlyChart(),
        initRadarChart(),
        initHeatmapChart()
    ];
    
    // 5. 窗口resize重绘
    window.addEventListener('resize', () => {
        charts.forEach(c => c.resize());
    });
    
    console.log('Music Dashboard loaded with', charts.length, 'charts + album wall');
});
