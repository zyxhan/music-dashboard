/*
    ============================================================
    🎵 音乐数据可视化仪表盘 - JavaScript核心逻辑
    ============================================================
    这个文件是整个项目的"大脑"，负责：
    1. 准备模拟数据（真实场景可以替换为网易云API数据）
    2. 初始化ECharts图表实例
    3. 配置每个图表的样式和交互
*/

/*
    【知识点18】模拟数据对象
    真实项目中，这部分数据通常来自：
    - 后端API接口（fetch/axios请求）
    - 用户上传的CSV/JSON文件
    - 网易云音乐开放API
    
    这里用硬编码的模拟数据，方便你直接看到效果
*/
const musicData = {
    // 一天24小时的听歌次数分布
    hourlyDistribution: [
        5, 3, 2, 1, 1, 2,     // 0-5点（深夜，听得少）
        8, 15, 20, 18, 12, 10, // 6-11点（上午，逐渐增多）
        25, 30, 28, 22, 20, 18, // 12-17点（下午，高峰期）
        35, 40, 38, 30, 20, 12, 8, 6 // 18-23点（晚上，最高峰）
    ],

    // 歌手TOP10：名字 + 听歌次数
    topArtists: [
        { name: '周杰伦', count: 328 },
        { name: '林俊杰', count: 256 },
        { name: '陈奕迅', count: 198 },
        { name: '薛之谦', count: 175 },
        { name: '毛不易', count: 142 },
        { name: '邓紫棋', count: 128 },
        { name: '李荣浩', count: 115 },
        { name: '许嵩', count: 98 },
        { name: '五月天', count: 87 },
        { name: 'Taylor Swift', count: 76 }
    ],

    // 音乐流派分布
    genreDistribution: [
        { value: 35, name: '流行 Pop' },
        { value: 20, name: '摇滚 Rock' },
        { value: 15, name: '民谣 Folk' },
        { value: 12, name: 'R&B/Soul' },
        { value: 10, name: '电子 Electronic' },
        { value: 8, name: '嘻哈 Hip-Hop' }
    ],

    // 2025年每月听歌数量
    monthlyTrend: [180, 165, 210, 195, 230, 250, 280, 260, 220, 200, 240, 270],

    // 音乐特征评分（0-100）用于雷达图
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
    },

    // 总计数据
    totalSongs: 2846,
    totalHours: 856,
    topArtist: '周杰伦',
    topGenre: '流行 Pop'
};

/*
    【知识点19】ECharts初始化基本模式
    echarts.init(dom) 把指定div变成图表画布
    .setOption(options) 传入配置对象渲染图表
    
    每个图表的配置都是一个大的JavaScript对象（option）
    可以控制：数据、颜色、坐标轴、提示框、图例等一切
*/

// ========== 1. 更新KPI卡片数据 ==========
/*
    【知识点20】DOM操作
    document.getElementById() 通过id获取HTML元素
    .textContent 修改元素的文本内容
    这是JS与HTML交互最基础的方式
*/
function updateKPIs() {
    document.getElementById('total-songs').textContent = musicData.totalSongs.toLocaleString();
    document.getElementById('total-hours').textContent = musicData.totalHours.toLocaleString();
    document.getElementById('top-artist').textContent = musicData.topArtist;
    document.getElementById('top-genre').textContent = musicData.topGenre;
}

// ========== 2. 时段分布柱状图 ==========
function initHoursChart() {
    const chart = echarts.init(document.getElementById('chart-hours'));
    
    /*
        【知识点21】ECharts配置结构
        option对象通常包含：
        - tooltip: 鼠标悬停提示框
        - xAxis/yAxis: 坐标轴
        - series: 数据系列（真正的图表数据）
        - grid: 图表在容器中的位置
    */
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(20,20,40,0.9)',
            borderColor: '#444',
            textStyle: { color: '#fff' }
        },
        grid: { top: 20, right: 20, bottom: 30, left: 50 },
        xAxis: {
            type: 'category',
            data: Array.from({length: 24}, (_, i) => i + '点'), // 生成["0点", "1点", ...]
            axisLine: { lineStyle: { color: '#666' } },
            axisLabel: { color: '#aaa', fontSize: 10 }
        },
        yAxis: {
            type: 'value',
            axisLine: { show: false },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
            axisLabel: { color: '#aaa' }
        },
        series: [{
            data: musicData.hourlyDistribution,
            type: 'bar',
            /* 
                柱状图圆角和渐变色
                new echarts.graphic.LinearGradient 创建线性渐变
                0,0,0,1 表示从上到下的渐变方向
            */
            itemStyle: {
                borderRadius: [4, 4, 0, 0],
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#b388ff' },  // 顶部紫色
                    { offset: 1, color: '#7c4dff' }   // 底部深紫
                ])
            },
            emphasis: {
                itemStyle: { color: '#ff79c6' } // 悬停时变粉色
            }
        }]
    };
    
    chart.setOption(option);
    return chart;
}

// ========== 3. 歌手TOP10横向柱状图 ==========
function initArtistsChart() {
    const chart = echarts.init(document.getElementById('chart-artists'));
    
    // 提取名字和次数，并反转顺序（让第一名在最上面）
    const names = musicData.topArtists.map(a => a.name).reverse();
    const counts = musicData.topArtists.map(a => a.count).reverse();
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(20,20,40,0.9)',
            textStyle: { color: '#fff' }
        },
        grid: { top: 10, right: 30, bottom: 10, left: 80 },
        xAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
            axisLabel: { color: '#aaa' }
        },
        yAxis: {
            type: 'category',
            data: names,
            axisLine: { show: false },
            axisLabel: { color: '#ccc', fontSize: 12 }
        },
        series: [{
            type: 'bar',
            data: counts,
            barWidth: 14,
            itemStyle: {
                borderRadius: [0, 7, 7, 0], // 右侧圆角
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#8be9fd' },
                    { offset: 1, color: '#50fa7b' }
                ])
            },
            // 在柱子末尾显示数字
            label: {
                show: true,
                position: 'right',
                color: '#ccc',
                fontSize: 11
            }
        }]
    };
    
    chart.setOption(option);
    return chart;
}

// ========== 4. 流派分布饼图 ==========
function initGenresChart() {
    const chart = echarts.init(document.getElementById('chart-genres'));
    
    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}首 ({d}%)', // 自定义提示格式
            backgroundColor: 'rgba(20,20,40,0.9)',
            textStyle: { color: '#fff' }
        },
        legend: {
            bottom: 0,
            textStyle: { color: '#aaa', fontSize: 10 },
            itemWidth: 12,
            itemHeight: 12
        },
        series: [{
            type: 'pie',
            radius: ['40%', '70%'], // 内半径和外半径，形成环形图
            center: ['50%', '45%'],
            avoidLabelOverlap: true,
            itemStyle: {
                borderRadius: 8,
                borderColor: '#0f0f1a',
                borderWidth: 3
            },
            /*
                【知识点22】标签样式配置
                label控制扇区上的文字
                labelLine是连接文字和扇区的引导线
            */
            label: {
                show: true,
                color: '#ccc',
                fontSize: 11,
                formatter: '{b}\n{d}%'
            },
            labelLine: { lineStyle: { color: '#666' } },
            // 暗色系配色方案
            data: musicData.genreDistribution,
            color: ['#b388ff', '#ff79c6', '#8be9fd', '#50fa7b', '#f1fa8c', '#ffb86c']
        }]
    };
    
    chart.setOption(option);
    return chart;
}

// ========== 5. 月度趋势折线图 ==========
function initMonthlyChart() {
    const chart = echarts.init(document.getElementById('chart-monthly'));
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(20,20,40,0.9)',
            textStyle: { color: '#fff' }
        },
        grid: { top: 30, right: 20, bottom: 30, left: 50 },
        xAxis: {
            type: 'category',
            data: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
            axisLine: { lineStyle: { color: '#666' } },
            axisLabel: { color: '#aaa', fontSize: 10 }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
            axisLabel: { color: '#aaa' }
        },
        series: [{
            data: musicData.monthlyTrend,
            type: 'line',
            smooth: true, // 平滑曲线
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
                color: '#ff79c6',
                width: 3
            },
            itemStyle: {
                color: '#ff79c6',
                borderColor: '#fff',
                borderWidth: 2
            },
            // 区域填充渐变
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(255, 121, 198, 0.4)' },
                    { offset: 1, color: 'rgba(255, 121, 198, 0)' }
                ])
            }
        }]
    };
    
    chart.setOption(option);
    return chart;
}

// ========== 6. 音乐偏好雷达图 ==========
function initRadarChart() {
    const chart = echarts.init(document.getElementById('chart-radar'));
    
    const option = {
        tooltip: {
            backgroundColor: 'rgba(20,20,40,0.9)',
            textStyle: { color: '#fff' }
        },
        radar: {
            // 雷达图的6个维度指标
            indicator: musicData.musicProfile.indicators,
            shape: 'polygon', // 多边形雷达图
            center: ['50%', '55%'],
            radius: '65%',
            axisName: {
                color: '#ccc',
                fontSize: 12
            },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
            splitArea: {
                areaStyle: {
                    color: ['rgba(179,136,255,0.05)', 'rgba(179,136,255,0.1)']
                }
            },
            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } }
        },
        series: [{
            type: 'radar',
            data: [{
                value: musicData.musicProfile.values,
                name: '我的偏好',
                // 填充区域样式
                areaStyle: {
                    color: 'rgba(139, 233, 253, 0.3)'
                },
                lineStyle: {
                    color: '#8be9fd',
                    width: 2
                },
                itemStyle: {
                    color: '#8be9fd'
                }
            }]
        }]
    };
    
    chart.setOption(option);
    return chart;
}

// ========== 7. 听歌热力图 ==========
function initHeatmapChart() {
    const chart = echarts.init(document.getElementById('chart-heatmap'));
    
    /*
        【知识点23】热力图数据处理
        热力图需要 [x, y, value] 格式的三维数据
        这里模拟一周7天 x 24小时的听歌强度
    */
    const hours = Array.from({length: 24}, (_, i) => i + '时');
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    
    // 生成模拟热力数据
    const heatData = [];
    for (let d = 0; d < 7; d++) {
        for (let h = 0; h < 24; h++) {
            let value;
            if (d < 5) { // 工作日
                value = (h >= 8 && h <= 22) ? Math.random() * 80 + 20 : Math.random() * 20;
            } else { // 周末
                value = (h >= 10 && h <= 24) ? Math.random() * 90 + 10 : Math.random() * 30;
            }
            heatData.push([h, d, Math.round(value)]);
        }
    }
    
    const option = {
        tooltip: {
            position: 'top',
            formatter: function(params) {
                return days[params.value[1]] + ' ' + hours[params.value[0]] + '<br/>活跃度: ' + params.value[2];
            },
            backgroundColor: 'rgba(20,20,40,0.9)',
            textStyle: { color: '#fff' }
        },
        grid: { top: 10, right: 20, bottom: 60, left: 60 },
        xAxis: {
            type: 'category',
            data: hours,
            splitArea: { show: true, areaStyle: { color: 'rgba(255,255,255,0.02)' } },
            axisLabel: { color: '#aaa', fontSize: 9, interval: 2 } // interval:2 隔一个显示
        },
        yAxis: {
            type: 'category',
            data: days,
            splitArea: { show: true, areaStyle: { color: 'rgba(255,255,255,0.02)' } },
            axisLabel: { color: '#aaa', fontSize: 11 }
        },
        visualMap: {
            min: 0,
            max: 100,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: 0,
            textStyle: { color: '#aaa' },
            // 从深蓝到亮紫的渐变
            inRange: {
                color: ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#b388ff', '#ff79c6']
            }
        },
        series: [{
            type: 'heatmap',
            data: heatData,
            label: { show: false },
            itemStyle: {
                borderColor: '#0f0f1a',
                borderWidth: 1,
                borderRadius: 3
            },
            emphasis: {
                itemStyle: { shadowBlur: 10, shadowColor: 'rgba(255, 121, 198, 0.5)' }
            }
        }]
    };
    
    chart.setOption(option);
    return chart;
}

/*
    【知识点24】页面加载完成后执行
    DOMContentLoaded 事件：浏览器解析完HTML后触发（不需要等图片CSS）
    把初始化逻辑包在里面，确保HTML元素已经存在再操作
*/
document.addEventListener('DOMContentLoaded', function() {
    // 1. 先更新KPI数字
    updateKPIs();
    
    // 2. 初始化所有图表，把返回的实例存到数组
    const charts = [
        initHoursChart(),
        initArtistsChart(),
        initGenresChart(),
        initMonthlyChart(),
        initRadarChart(),
        initHeatmapChart()
    ];
    
    /*
        【知识点25】窗口大小改变时重绘图表
        浏览器窗口缩放时，图表不会自动适配
        需要监听resize事件，调用每个图表的resize()方法
        这是响应式图表必须做的一步
    */
    window.addEventListener('resize', function() {
        charts.forEach(chart => chart.resize());
    });
    
    console.log('🎵 音乐仪表盘加载完成！共渲染', charts.length, '个图表');
});
