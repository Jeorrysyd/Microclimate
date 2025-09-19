// Typeform 配置文件
// 在这里配置你的 Typeform 表单设置

const TYPEFORM_CONFIG = {
    // 你的 Typeform 表单 ID（从 Typeform 后台获取）
    FORM_ID: 'YOUR_FORM_ID', // 替换为实际的表单ID
    
    // Typeform 工作区信息
    WORKSPACE: {
        account: '01K5GBS1PTZY5EW1D4DJ8Y9JRX',
        workspace: 'yMjVGn'
    },
    
    // 嵌入选项
    EMBED_OPTIONS: {
        opacity: 0,
        height: '400px',
        width: '100%',
        hideHeaders: true,
        hideFooter: true
    },
    
    // 建议的问题结构
    SUGGESTED_QUESTIONS: [
        {
            type: 'multiple_choice',
            question: '你对这次微气候体验的整体感受如何？',
            options: ['非常好 😊', '还不错 👍', '一般般 😐', '不太满意 😕']
        },
        {
            type: 'multiple_choice', 
            question: '你最喜欢哪个功能？',
            options: ['呼吸引导', '背景音效', '计时器', '整体氛围']
        },
        {
            type: 'multiple_choice',
            question: '你主要在什么场景下使用？',
            options: ['工作间隙放松', '睡前冥想', '焦虑时刻', '日常练习']
        },
        {
            type: 'long_text',
            question: '有什么建议或想法想要分享吗？',
            placeholder: '请分享你的想法和建议...'
        }
    ]
};

// 动态更新 Typeform 嵌入代码
function updateTypeformEmbed(formId) {
    if (!formId || formId === 'YOUR_FORM_ID') {
        console.log('请先在 typeform-config.js 中设置正确的 FORM_ID');
        return;
    }
    
    // 更新 widget 嵌入
    const widget = document.querySelector('[data-tf-widget]');
    if (widget) {
        widget.setAttribute('data-tf-widget', formId);
    }
    
    // 更新 iframe 嵌入
    const iframe = document.querySelector('.typeform-iframe-fallback iframe');
    if (iframe) {
        iframe.src = `https://form.typeform.com/to/${formId}?typeform-medium=embed-snippet`;
    }
    
    // 更新直接链接
    const link = document.querySelector('.typeform-link-btn');
    if (link) {
        link.href = `https://form.typeform.com/to/${formId}`;
    }
    
    console.log(`Typeform 表单已更新为: ${formId}`);
}

// 页面加载时自动更新
document.addEventListener('DOMContentLoaded', () => {
    if (TYPEFORM_CONFIG.FORM_ID !== 'YOUR_FORM_ID') {
        updateTypeformEmbed(TYPEFORM_CONFIG.FORM_ID);
    }
});

// 导出配置供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TYPEFORM_CONFIG;
}