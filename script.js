// 微气候Web端MVP - 主要JavaScript功能
class MicroclimateApp {
    constructor() {
        this.currentState = null;
        this.currentAudio = 'none';
        this.timer = null;
        this.timeLeft = 180; // 3分钟 = 180秒
        this.isPaused = false;
        this.isRunning = false;
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.breathingPhase = 'inhale'; // 呼吸阶段：inhale(吸气) 或 exhale(呼气)
        this.breathingCycle = 0; // 呼吸周期计数
        this.hasShownReleaseText = false; // 是否已显示神经系统释放文字
        
        this.init();
    }

    // 初始化应用
    init() {
        this.bindEvents();
        this.trackEvent('page_view', { page: 'home' });
    }

    // 生成会话ID
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 绑定事件监听器
    bindEvents() {
        // 状态选择
        document.querySelectorAll('.state-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectState(e));
        });

        // 开始按钮
        document.getElementById('start-btn').addEventListener('click', () => this.startExperience());

        // 返回按钮
        document.getElementById('back-btn').addEventListener('click', () => this.goBack());

        // 音频控制
        document.querySelectorAll('.audio-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectAudio(e));
        });

        // 控制按钮
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartTimer());
        document.getElementById('end-early-btn').addEventListener('click', () => this.endEarly());

        // 反馈按钮
        document.querySelectorAll('.feedback-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectFeedback(e));
        });

        // 关键问题选项按钮
        document.querySelectorAll('.question-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectQuestionOption(e));
        });

        // 提交反馈
        document.getElementById('submit-feedback-btn').addEventListener('click', () => this.submitFeedback());

        // 重新开始体验
        document.getElementById('restart-experience-btn').addEventListener('click', () => this.restartExperience());

        // 页面可见性变化处理
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }

    // 选择状态
    selectState(event) {
        const option = event.currentTarget;
        const state = option.dataset.state;
        
        // 移除其他选中状态
        document.querySelectorAll('.state-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // 添加选中状态
        option.classList.add('selected');
        this.currentState = state;
        
        // 启用开始按钮
        const startBtn = document.getElementById('start-btn');
        startBtn.disabled = false;
        
        this.trackEvent('state_selected', { 
            state: state,
            duration: Math.floor((Date.now() - this.startTime) / 1000)
        });
    }

    // 开始体验
    startExperience() {
        if (!this.currentState) return;
        
        this.showPage('experience-page');
        this.startTimer();
        this.trackEvent('experience_started', { state: this.currentState });
    }

    // 选择音频
    selectAudio(event) {
        const btn = event.currentTarget;
        const audioType = btn.dataset.audio;
        
        // 移除其他选中状态
        document.querySelectorAll('.audio-btn').forEach(b => {
            b.classList.remove('active');
        });
        
        // 添加选中状态
        btn.classList.add('active');
        
        // 停止当前音频
        this.stopAllAudio();
        
        // 播放新音频
        if (audioType !== 'none') {
            this.playAudio(audioType);
        }
        
        this.currentAudio = audioType;
    }

    // 播放音频
    playAudio(type) {
        const audioElement = document.getElementById(`${type}-audio`);
        if (audioElement) {
            console.log(`尝试播放音频: ${type}`, audioElement.src);
            audioElement.currentTime = 0;
            audioElement.play().catch(error => {
                console.log('音频播放失败:', error);
                console.log('音频元素:', audioElement);
                console.log('音频源:', audioElement.src);
                // 移动端浏览器需要用户交互才能播放音频
                // 显示提示信息
                this.showAudioError(type);
            });
        } else {
            console.log(`音频元素未找到: ${type}-audio`);
        }
    }

    // 显示音频错误提示
    showAudioError(type) {
        const audioNames = {
            'birds': '春天鸟鸣声',
            'rain': '大雨白噪音', 
            'heartbeat': '心跳声',
            'waves': '海浪声'
        };
        const audioName = audioNames[type] || '音频';
        console.log(`${audioName}暂时无法播放，请稍后再试`);
        // 可以在这里添加用户友好的提示
    }

    // 停止所有音频
    stopAllAudio() {
        document.querySelectorAll('audio').forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
    }

    // 开始计时器
    startTimer() {
        this.isRunning = true;
        this.isPaused = false;
        this.breathingPhase = 'inhale';
        this.breathingCycle = 0;
        this.updateTimerDisplay();
        this.updateBreathingPrompt();
        
        this.timer = setInterval(() => {
            if (!this.isPaused) {
                this.timeLeft--;
                this.updateTimerDisplay();
                this.updateBreathingPrompt();
                
                if (this.timeLeft <= 0) {
                    this.completeExperience();
                }
            }
        }, 1000);
    }

    // 更新计时器显示
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timer').textContent = display;
    }

    // 更新呼吸提示
    updateBreathingPrompt() {
        if (!this.isRunning || this.isPaused) return;
        
        const totalSeconds = 180 - this.timeLeft;
        const breathingCircle = document.querySelector('.breathing-circle');
        
        // 旁边的详细引导
        let guideText = '';
        let showBreathing = false;
        
        // 简化为三阶段循环，每8秒一个循环
        const cycleTime = totalSeconds % 8;
        showBreathing = true;
        breathingCircle.classList.add('active');
        
        // 更新引导文字
        const introTextElement = document.getElementById('intro-text');
        
        // 检查是否已经显示过神经系统释放文字
        if (!this.hasShownReleaseText && totalSeconds >= 4) {
            this.hasShownReleaseText = true;
        }
        
        if (cycleTime < 2) {
            guideText = '正常吸气...';
            if (introTextElement && !this.hasShownReleaseText) {
                introTextElement.textContent = '让我们开始使用最有效的快速平静技术';
            }
        } else if (cycleTime < 4) {
            guideText = '不呼气，现在再吸一口气，填满肺部...';
            if (introTextElement && !this.hasShownReleaseText) {
                introTextElement.textContent = '让我们开始使用最有效的快速平静技术';
            }
        } else {
            guideText = '慢慢通过嘴唇呼出所有空气。';
            if (introTextElement && this.hasShownReleaseText) {
                introTextElement.textContent = '感受到释放了吗？这是你的神经系统在转向平静...';
            }
        }
        
        // 圆圈内的简单提示（只有在显示呼吸阶段才显示）
        let breathingText = '';
        if (showBreathing) {
            // 清除之前的动画类
            breathingCircle.classList.remove('short-inhale', 'deep-inhale', 'long-exhale');
            
            // 简化为三阶段循环：短吸气2秒，深吸气2秒，长呼气4秒
            if (cycleTime < 2) {
                this.breathingPhase = 'short-inhale';
                breathingText = '短吸气';
                breathingCircle.classList.add('short-inhale');
            } else if (cycleTime < 4) {
                this.breathingPhase = 'deep-inhale';
                breathingText = '深吸气';
                breathingCircle.classList.add('deep-inhale');
            } else {
                this.breathingPhase = 'long-exhale';
                breathingText = '深呼气';
                breathingCircle.classList.add('long-exhale');
            }
        }
        
        document.getElementById('breathing-text').textContent = breathingText;
        document.getElementById('breathing-guide').textContent = guideText;
    }

    // 切换暂停状态
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pause-btn');
        pauseBtn.textContent = this.isPaused ? '继续' : '暂停';
        
        // 暂停/继续呼吸动画
        const breathingCircle = document.getElementById('breathing-circle');
        if (this.isPaused) {
            breathingCircle.style.animationPlayState = 'paused';
        } else {
            breathingCircle.style.animationPlayState = 'running';
        }
    }

    // 重新开始计时器
    restartTimer() {
        this.stopTimer();
        this.timeLeft = 180;
        this.isPaused = false;
        this.isRunning = false;
        this.breathingPhase = 'inhale';
        this.breathingCycle = 0;
        this.updateTimerDisplay();
        this.updateBreathingPrompt();
        
        const pauseBtn = document.getElementById('pause-btn');
        pauseBtn.textContent = '暂停';
        
        const breathingCircle = document.getElementById('breathing-circle');
        breathingCircle.style.animationPlayState = 'running';
        
        this.startTimer();
    }

    // 提前结束
    endEarly() {
        if (confirm('确定要提前结束呼吸训练吗？')) {
            this.stopTimer();
            this.stopAllAudio();
            this.showPage('feedback-page');
            
            this.trackEvent('experience_ended_early', {
                state: this.currentState,
                audio: this.currentAudio,
                duration: 180 - this.timeLeft,
                breathingPhase: this.breathingPhase
            });
        }
    }

    // 停止计时器
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.isRunning = false;
    }

    // 完成体验
    completeExperience() {
        this.stopTimer();
        this.stopAllAudio();
        this.showPage('feedback-page');
        
        this.trackEvent('experience_completed', {
            state: this.currentState,
            audio: this.currentAudio,
            duration: 180 - this.timeLeft,
            breathingPhase: this.breathingPhase
        });
    }

    // 选择反馈
    selectFeedback(event) {
        const btn = event.currentTarget;
        const feedback = btn.dataset.feedback;
        
        // 移除其他选中状态
        document.querySelectorAll('.feedback-btn').forEach(b => {
            b.classList.remove('selected');
        });
        
        // 添加选中状态
        btn.classList.add('selected');
        
        this.selectedFeedback = feedback;
        
        // 启用提交按钮
        const submitBtn = document.getElementById('submit-feedback-btn');
        submitBtn.disabled = false;
    }

    // 选择关键问题选项
    selectQuestionOption(event) {
        const btn = event.currentTarget;
        const question = btn.dataset.question;
        const answer = btn.dataset.answer;
        
        // 移除同一问题的其他选中状态
        document.querySelectorAll(`[data-question="${question}"]`).forEach(b => {
            b.classList.remove('selected');
        });
        
        // 添加选中状态
        btn.classList.add('selected');
        
        // 存储答案
        if (!this.questionAnswers) {
            this.questionAnswers = {};
        }
        this.questionAnswers[question] = answer;
    }

    // 提交反馈
    submitFeedback() {
        if (!this.selectedFeedback) return;
        
        const suggestion = document.getElementById('suggestion-input').value.trim();
        const usageScenario = document.getElementById('usage-scenario-input').value.trim();
        const firstImpression = document.getElementById('first-impression-input').value.trim();
        
        // 收集关键问题数据
        const keyQuestionsData = {
            usageScenario: usageScenario,
            busyUsage: this.questionAnswers?.busyUsage || null,
            firstImpression: firstImpression
        };
        
        this.trackEvent('feedback_submitted', {
            feedback: this.selectedFeedback,
            suggestion: suggestion,
            hasSuggestion: suggestion.length > 0,
            keyQuestions: keyQuestionsData,
            hasUsageScenario: usageScenario.length > 0,
            hasFirstImpression: firstImpression.length > 0
        });
        
        // 显示提交成功提示
        const submitBtn = document.getElementById('submit-feedback-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '已提交 ✓';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }

    // 重新开始体验
    restartExperience() {
        // 重置状态
        this.currentState = null;
        this.currentAudio = 'none';
        this.timeLeft = 180;
        this.isPaused = false;
        this.isRunning = false;
        this.selectedFeedback = null;
        this.questionAnswers = {};
        this.breathingPhase = 'inhale';
        this.breathingCycle = 0;
        
        // 停止所有音频
        this.stopAllAudio();
        
        // 重置UI状态
        document.querySelectorAll('.state-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        document.querySelectorAll('.audio-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelectorAll('.feedback-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        document.querySelectorAll('.question-option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        document.getElementById('start-btn').disabled = true;
        document.getElementById('suggestion-input').value = '';
        document.getElementById('usage-scenario-input').value = '';
        document.getElementById('first-impression-input').value = '';
        
        // 返回首页
        this.showPage('home-page');
        
        // 重新生成会话ID
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        
        this.trackEvent('restart_experience');
    }

    // 返回上一页
    goBack() {
        if (this.isRunning) {
            this.stopTimer();
            this.stopAllAudio();
        }
        this.showPage('home-page');
    }

    // 显示页面
    showPage(pageId) {
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // 显示目标页面
        document.getElementById(pageId).classList.add('active');
        
        // 更新页面标题
        const titles = {
            'home-page': '微气候 - 不是治疗，只是休息',
            'experience-page': '呼吸RESET - 微气候',
            'feedback-page': '体验完成 - 微气候'
        };
        document.title = titles[pageId] || '微气候';
    }

    // 处理页面可见性变化
    handleVisibilityChange() {
        if (document.hidden && this.isRunning && !this.isPaused) {
            // 页面隐藏时暂停计时器
            this.togglePause();
        }
    }

    // 数据埋点
    trackEvent(action, data = {}) {
        const now = new Date();
        const eventData = {
            session_id: this.sessionId,
            timestamp: now.toISOString(),
            action: action,
            data: data,
            // 新增时间戳记录
            hour: now.getHours(),
            dayOfWeek: now.getDay(), // 0=周日, 1=周一, ..., 6=周六
            date: now.toDateString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            isEvening: now.getHours() >= 21 && now.getHours() <= 23, // 晚9-11点
            isWorkHours: now.getHours() >= 9 && now.getHours() <= 17, // 工作时间
            isWeekend: now.getDay() === 0 || now.getDay() === 6 // 周末
        };
        
        // 在控制台输出（实际项目中可以发送到服务器）
        console.log('Event tracked:', eventData);
        
        // Vercel Analytics 事件追踪
        if (typeof window !== 'undefined' && window.va) {
            try {
                window.va('track', action, {
                    ...data,
                    hour: now.getHours(),
                    dayOfWeek: now.getDay(),
                    isEvening: now.getHours() >= 21 && now.getHours() <= 23,
                    isWorkHours: now.getHours() >= 9 && now.getHours() <= 17,
                    isWeekend: now.getDay() === 0 || now.getDay() === 6
                });
            } catch (error) {
                console.log('Vercel Analytics tracking error:', error);
            }
        }
        
        // 存储到localStorage（用于调试）
        try {
            const events = JSON.parse(localStorage.getItem('microclimate_events') || '[]');
            events.push(eventData);
            localStorage.setItem('microclimate_events', JSON.stringify(events));
        } catch (error) {
            console.log('Failed to store event:', error);
        }
    }

    // 获取统计数据
    getStats() {
        try {
            const events = JSON.parse(localStorage.getItem('microclimate_events') || '[]');
            return this.calculateStats(events);
        } catch (error) {
            console.log('Failed to get stats:', error);
            return null;
        }
    }

    // 计算统计数据
    calculateStats(events) {
        const stats = {
            totalSessions: 0,
            stateSelectionRate: 0,
            experienceStartRate: 0,
            experienceCompletionRate: 0,
            feedbackSubmissionRate: 0,
            // 新增时间分析
            timeAnalysis: {
                hourlyUsage: {},
                dailyUsage: {},
                eveningUsage: 0,
                workHoursUsage: 0,
                weekendUsage: 0
            }
        };
        
        const sessions = new Set();
        let stateSelections = 0;
        let experienceStarts = 0;
        let experienceCompletions = 0;
        let experienceEndedEarly = 0;
        let feedbackSubmissions = 0;
        
        // 初始化小时统计
        for (let i = 0; i < 24; i++) {
            stats.timeAnalysis.hourlyUsage[i] = 0;
        }
        
        // 初始化星期统计
        const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        dayNames.forEach(day => {
            stats.timeAnalysis.dailyUsage[day] = 0;
        });
        
        events.forEach(event => {
            sessions.add(event.session_id);
            
            // 统计时间数据
            if (event.hour !== undefined) {
                stats.timeAnalysis.hourlyUsage[event.hour]++;
            }
            if (event.dayOfWeek !== undefined) {
                stats.timeAnalysis.dailyUsage[dayNames[event.dayOfWeek]]++;
            }
            if (event.isEvening) {
                stats.timeAnalysis.eveningUsage++;
            }
            if (event.isWorkHours) {
                stats.timeAnalysis.workHoursUsage++;
            }
            if (event.isWeekend) {
                stats.timeAnalysis.weekendUsage++;
            }
            
            switch (event.action) {
                case 'state_selected':
                    stateSelections++;
                    break;
                case 'experience_started':
                    experienceStarts++;
                    break;
                case 'experience_completed':
                    experienceCompletions++;
                    break;
                case 'experience_ended_early':
                    experienceEndedEarly++;
                    break;
                case 'feedback_submitted':
                    feedbackSubmissions++;
                    break;
            }
        });
        
        stats.totalSessions = sessions.size;
        stats.stateSelectionRate = sessions.size > 0 ? (stateSelections / sessions.size * 100).toFixed(1) : 0;
        stats.experienceStartRate = stateSelections > 0 ? (experienceStarts / stateSelections * 100).toFixed(1) : 0;
        stats.experienceCompletionRate = experienceStarts > 0 ? (experienceCompletions / experienceStarts * 100).toFixed(1) : 0;
        stats.experienceEndedEarlyRate = experienceStarts > 0 ? (experienceEndedEarly / experienceStarts * 100).toFixed(1) : 0;
        stats.feedbackSubmissionRate = (experienceCompletions + experienceEndedEarly) > 0 ? (feedbackSubmissions / (experienceCompletions + experienceEndedEarly) * 100).toFixed(1) : 0;
        
        return stats;
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.microclimateApp = new MicroclimateApp();
    
    // 添加一些调试功能（开发环境）
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // 添加调试控制台
        window.debugStats = () => {
            const stats = window.microclimateApp.getStats();
            console.table(stats);
            return stats;
        };
        
        // 添加时间分析功能
        window.timeAnalysis = () => {
            const stats = window.microclimateApp.getStats();
            if (!stats || !stats.timeAnalysis) {
                console.log('暂无时间数据');
                return;
            }
            
            console.log('=== 时间使用分析 ===');
            console.log('晚9-11点使用次数:', stats.timeAnalysis.eveningUsage);
            console.log('工作时间使用次数:', stats.timeAnalysis.workHoursUsage);
            console.log('周末使用次数:', stats.timeAnalysis.weekendUsage);
            
            console.log('\n=== 小时使用分布 ===');
            const hourlyData = Object.entries(stats.timeAnalysis.hourlyUsage)
                .filter(([hour, count]) => count > 0)
                .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
            hourlyData.forEach(([hour, count]) => {
                console.log(`${hour}:00 - ${count}次`);
            });
            
            console.log('\n=== 星期使用分布 ===');
            Object.entries(stats.timeAnalysis.dailyUsage)
                .filter(([day, count]) => count > 0)
                .forEach(([day, count]) => {
                    console.log(`${day}: ${count}次`);
                });
            
            return stats.timeAnalysis;
        };
        
        // 清除数据
        window.clearData = () => {
            localStorage.removeItem('microclimate_events');
            console.log('数据已清除');
        };
        
        // 添加时间模式分析函数
        window.analyzeTimePatterns = () => {
            const events = JSON.parse(localStorage.getItem('microclimate_events') || '[]');
            
            if (events.length === 0) {
                console.log('暂无时间数据');
                return;
            }
            
            // 按小时分组
            const hourlyUse = {};
            events.forEach(event => {
                const hour = event.hour;
                if (hour !== undefined) {
                    hourlyUse[hour] = (hourlyUse[hour] || 0) + 1;
                }
            });
            
            // 计算晚间使用率（关键指标）
            const eveningUse = (hourlyUse[21] || 0) + (hourlyUse[22] || 0) + (hourlyUse[23] || 0);
            const totalUse = Object.values(hourlyUse).reduce((a, b) => a + b, 0);
            const eveningRate = totalUse > 0 ? (eveningUse / totalUse * 100).toFixed(1) : 0;
            
            console.log('=== 时间模式分析 ===');
            console.log('每小时使用分布:', hourlyUse);
            console.log(`晚9-11点使用率: ${eveningRate}%`);
            console.log('总事件数:', totalUse);
            
            // 显示详细的小时分布
            console.log('\n=== 详细小时分布 ===');
            Object.entries(hourlyUse)
                .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                .forEach(([hour, count]) => {
                    const rate = (count / totalUse * 100).toFixed(1);
                    const isEvening = hour >= 21 && hour <= 23;
                    const marker = isEvening ? '🌙' : '';
                    console.log(`${hour}:00 - ${count}次 (${rate}%) ${marker}`);
                });
            
            // 疲惫时段验证
            console.log('\n=== 疲惫时段验证 ===');
            if (eveningRate > 20) {
                console.log('✅ 假设成立：用户在疲惫时段（晚9-11点）使用率较高');
            } else if (eveningRate > 10) {
                console.log('⚠️ 假设部分成立：疲惫时段使用率中等');
            } else {
                console.log('❌ 假设不成立：疲惫时段使用率较低');
            }
            
            return { hourlyUse, eveningRate, totalEvents: totalUse };
        };
        
        console.log('调试功能已加载:');
        console.log('- debugStats() - 查看统计数据');
        console.log('- timeAnalysis() - 查看时间使用分析');
        console.log('- analyzeTimePatterns() - 分析时间模式');
        console.log('- clearData() - 清除本地数据');
    }
});

// 处理音频加载错误
document.addEventListener('DOMContentLoaded', () => {
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
        audio.addEventListener('error', (e) => {
            console.log(`音频文件加载失败: ${audio.id}`);
            // 可以在这里添加备用音频或提示用户
        });
    });
});

// 处理网络状态变化
window.addEventListener('online', () => {
    console.log('网络已连接');
});

window.addEventListener('offline', () => {
    console.log('网络已断开');
});

// 防止页面意外刷新
window.addEventListener('beforeunload', (e) => {
    if (window.microclimateApp && window.microclimateApp.isRunning) {
        e.preventDefault();
        e.returnValue = '体验正在进行中，确定要离开吗？';
    }
});
