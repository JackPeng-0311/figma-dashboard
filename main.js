document.addEventListener('DOMContentLoaded', () => {
    // 动态设置固定头部高度，避免遮挡内容
    const mainHeader = document.querySelector('.main-header');
    const leftSticky = document.querySelector('#find-consultant-view .consultant-input-card');
    const rightSticky = document.querySelector('#find-consultant-view .birthday-banner');
    const rootStyle = document.documentElement.style;

    function updateDynamicHeights() {
        if (mainHeader) {
            const rect = mainHeader.getBoundingClientRect();
            rootStyle.setProperty('--main-header-h', rect.height + 'px');
        }
        if (leftSticky) {
            const r = leftSticky.getBoundingClientRect();
            rootStyle.setProperty('--left-sticky-h', r.height + 'px');
        }
        if (rightSticky) {
            const r = rightSticky.getBoundingClientRect();
            rootStyle.setProperty('--right-sticky-h', r.height + 'px');
        }

        // 统一两侧滚动区域底部截断：取顶部组件高度的最大值
        const leftH = leftSticky ? leftSticky.getBoundingClientRect().height : 0;
        const rightH = rightSticky ? rightSticky.getBoundingClientRect().height : 0;
        const maxH = Math.max(leftH, rightH);
        rootStyle.setProperty('--sticky-max-h', maxH + 'px');
    }
    
    // 将与“寻找顾问”视图相关的粘性高度清零，避免其他视图出现多余留白
    function resetStickyHeights() {
        rootStyle.setProperty('--left-sticky-h', '0px');
        rootStyle.setProperty('--right-sticky-h', '0px');
        rootStyle.setProperty('--sticky-max-h', '0px');
    }
    updateDynamicHeights();
    window.addEventListener('resize', updateDynamicHeights);

    // --- 菜单交互逻辑 ---
    
    // 获取所有菜单项
    const menuItems = document.querySelectorAll('.menu-item');
    
    // 获取所有视图
    const views = {
        'real-time': document.getElementById('real-time-view'),
        'comparison': document.getElementById('comparison-view'),
        'market-report': document.getElementById('market-report-view'),
        'market-size-chart': document.getElementById('market-size-chart-view'),
        'marketing-plan': document.getElementById('marketing-plan-view'),
        'find-consultant': document.getElementById('find-consultant-view'),
        'my-consultant': document.getElementById('my-consultant-view'),
        'case-report': document.getElementById('case-library-view'),
        'overseas-cases': document.getElementById('overseas-cases-view'),
        'hash-value': document.getElementById('hash-value-view'),
        'cultural-adaptation': document.getElementById('cultural-adaptation-view'),
        'help-center': document.getElementById('help-center-view')
    };

        // 隐藏所有视图的函数
        function hideAllViews() {
            Object.values(views).forEach(view => {
                if (view) view.classList.add('hidden');
            });
            
            // 隐藏文化适配检测的结果区域
            const culturalResults = document.getElementById('cultural-adaptation-results');
            if (culturalResults) {
                culturalResults.classList.add('hidden');
            }
        }

    // 移除所有菜单项激活状态的函数
    function removeAllActiveStates() {
        menuItems.forEach(item => {
            item.classList.remove('active', 'open');
        });
        
        // 移除所有子菜单链接的激活状态
        document.querySelectorAll('.sub-menu a').forEach(link => {
            link.classList.remove('active');
        });
    }

    // 显示指定视图的函数
    function showView(viewId) {
        hideAllViews();
        if (views[viewId]) {
            views[viewId].classList.remove('hidden');
        }

        // 当进入"寻找顾问"视图，仅保留内部滚动；否则恢复页面滚动
        if (viewId === 'find-consultant') {
            document.body.classList.add('no-scroll');
            // 进入“寻找顾问”时根据当前布局重新计算所需高度
            updateDynamicHeights();
        } else {
            document.body.classList.remove('no-scroll');
            // 离开“寻找顾问”视图时，清空其专用高度，避免其它视图（如帮助中心）产生空白
            resetStickyHeights();
        }

        // 进入“帮助中心”时，进一步在局部强制覆盖粘性高度，确保无额外空白
        if (viewId === 'help-center') {
            rootStyle.setProperty('--left-sticky-h', '0px');
            rootStyle.setProperty('--right-sticky-h', '0px');
            rootStyle.setProperty('--sticky-max-h', '0px');
        }
        
        // 当进入"我的顾问"视图时，重新设置点击区域
        if (viewId === 'my-consultant') {
            setTimeout(() => {
                setupContactClickAreas();
            }, 100);
        }

        // 进入哈希值页面后，绑定上传点击交互
        if (viewId === 'hash-value') {
            setupHashUploadClick();
        }
    }

    // 激活指定菜单项的函数
    function activateMenuItem(menuItem) {
        removeAllActiveStates();
        menuItem.classList.add('active');
        
        // 注意：不再自动添加open类，由点击事件手动控制
    }

    // 处理菜单项点击的函数
    function handleMenuItemClick(event) {
        event.preventDefault();
        
        const menuItem = event.currentTarget.closest('.menu-item');
        const subMenu = menuItem.querySelector('.sub-menu');
        
        // 检查是否有子菜单
        if (subMenu) {
            // 有子菜单的情况：只切换展开/收起状态，不切换页面
            const isCurrentlyOpen = menuItem.classList.contains('open');
            
            if (isCurrentlyOpen) {
                // 如果当前已展开，则收起
                menuItem.classList.remove('open');
                removeAllActiveStates();
                // 显示默认视图（历史方案对比）
                showView('comparison');
            } else {
                // 如果当前未展开，则展开
                removeAllActiveStates();
                menuItem.classList.add('open');
                // 不切换页面，保持当前页面
            }
        } else {
            // 没有子菜单的情况：直接切换页面
            const isCurrentlyActive = menuItem.classList.contains('active');
            
            if (isCurrentlyActive) {
                // 如果当前菜单项已激活，则取消激活
                removeAllActiveStates();
                // 显示默认视图（历史方案对比）
                showView('comparison');
            } else {
                // 激活当前菜单项
                activateMenuItem(menuItem);
                
                // 根据菜单项显示对应视图
                const dataView = menuItem.querySelector('[data-view]')?.getAttribute('data-view');
                if (dataView) {
                    showView(dataView);
                } else {
                    // 默认显示历史方案对比
                    showView('comparison');
                }
            }
        }
    }

    // 处理子菜单项点击的函数
    function handleSubMenuItemClick(event) {
        event.preventDefault();
        
        const menuItem = event.currentTarget.closest('.menu-item');
        const dataView = event.currentTarget.getAttribute('data-view') || event.currentTarget.getAttribute('href')?.substring(1);
        
        // 激活父菜单项并确保子菜单展开
        removeAllActiveStates();
        menuItem.classList.add('active', 'open');
        
        // 移除所有子菜单链接的激活状态
        document.querySelectorAll('.sub-menu a').forEach(link => {
            link.classList.remove('active');
        });
        
        // 激活当前点击的子菜单链接
        event.currentTarget.classList.add('active');
        
        // 显示对应视图
        if (dataView) {
            showView(dataView);
        }
    }

    // 添加事件监听器
    menuItems.forEach(menuItem => {
        // 为菜单项头部添加点击事件
        const menuHeader = menuItem.querySelector('.menu-item-header');
        if (menuHeader) {
            menuHeader.addEventListener('click', handleMenuItemClick);
        }
        
        // 为子菜单项添加点击事件
        const subMenuItems = menuItem.querySelectorAll('.sub-menu a');
        subMenuItems.forEach(subMenuItem => {
            subMenuItem.addEventListener('click', handleSubMenuItemClick);
        });
    });

    // 初始化设置
    // 默认显示历史方案对比视图，并激活数据看板菜单项
    showView('comparison');
    
    // 激活数据看板菜单项（第一个菜单项）
    const firstMenuItem = menuItems[0];
    if (firstMenuItem) {
        firstMenuItem.classList.add('active', 'open');
        
        // 激活"历史方案对比"子菜单项
        const comparisonSubMenu = firstMenuItem.querySelector('a[href="#comparison"]');
        if (comparisonSubMenu) {
            comparisonSubMenu.classList.add('active');
        }
        }
        
        // 添加联系人点击切换聊天窗口功能
        function setupContactClickAreas() {
            const contactItems = document.querySelectorAll('#my-consultant-view .contact-item');
            const chatListImage = document.querySelector('#my-consultant-view .chat-list-image');
            
            if (contactItems.length === 0 || !chatListImage) {
                return;
            }
            
            contactItems.forEach((item, index) => {
                // 设置基本样式
                item.style.position = 'absolute';
                item.style.backgroundColor = 'transparent';
                item.style.border = 'none';
                item.style.cursor = 'pointer';
                item.style.zIndex = '20';
                
                const x = parseFloat(item.getAttribute('data-x')) || 20;
                const y = parseFloat(item.getAttribute('data-y')) || 120;
                const width = parseFloat(item.getAttribute('data-width')) || 365;
                const height = parseFloat(item.getAttribute('data-height')) || 80;
                
                // 根据SVG的实际尺寸计算相对位置
                const rect = chatListImage.getBoundingClientRect();
                const scaleX = rect.width / 405; // SVG原始宽度
                const scaleY = rect.height / rect.height; // 保持原始比例
                
                // 设置点击区域的位置和大小
                const left = x * scaleX;
                const top = y * scaleY;
                const itemWidth = width * scaleX;
                const itemHeight = height * scaleY;
                
                item.style.left = left + 'px';
                item.style.top = top + 'px';
                item.style.width = itemWidth + 'px';
                item.style.height = itemHeight + 'px';
                
                // 移除旧的事件监听器
                item.removeEventListener('click', handleContactClick);
                // 添加新的事件监听器
                item.addEventListener('click', handleContactClick);
            });
        }
        
        function handleContactClick(e) {
            e.preventDefault();
            e.stopPropagation();
            const contact = e.target.getAttribute('data-contact');
            console.log('Contact clicked:', contact);
            if (contact) {
                switchChatWindow(contact);
            }
        }
        
        // 初始化联系人点击区域
        setupContactClickAreas();
        
        // 延迟执行，确保DOM完全加载
        setTimeout(() => {
            setupContactClickAreas();
            // 设置默认选中状态（贾剑锋）
            const jiajianItem = document.querySelector('#my-consultant-view .contact-item[data-contact="jiajian"]');
            if (jiajianItem) {
                jiajianItem.classList.add('active');
            }
        }, 1000);
        
        // 页面完全加载后再次尝试
        window.addEventListener('load', () => {
            setTimeout(() => {
                setupContactClickAreas();
                // 确保默认选中状态
                const jiajianItem = document.querySelector('#my-consultant-view .contact-item[data-contact="jiajian"]');
                if (jiajianItem) {
                    jiajianItem.classList.add('active');
                }
            }, 500);
        });
        
        // 窗口大小变化时重新计算位置
        window.addEventListener('resize', setupContactClickAreas);

        // ----------------- 哈希值页面：点击加号区域渲染文件条目 -----------------
        function setupHashUploadClick() {
            const clickArea = document.getElementById('hash-upload-click');
            const generateBtn = document.getElementById('hash-generate-btn');
            const verifyClick = document.getElementById('hash-verify-click');
            if (!clickArea) return;

            // 如果已经渲染过，避免重复绑定
            if (clickArea.dataset.bound === '1') return;
            clickArea.dataset.bound = '1';

            clickArea.addEventListener('click', () => {
                // 若已存在插槽，直接返回
                const wrapper = clickArea.parentElement;
                if (!wrapper) return;
                if (wrapper.querySelector('.hash-upload-slot')) return;

                const slot = document.createElement('div');
                slot.className = 'hash-upload-slot';
                slot.innerHTML = `
                    <div class="file-info">
                        <img src="./images/avatar.png" alt="thumb" width="36" height="36" style="border-radius:6px;" />
                        <div>
                            <div>印尼禽月营销海报（2024）.jpg</div>
                            <div class="file-sub">来自“本地”文件</div>
                        </div>
                    </div>
                    <div class="file-size">32mb</div>
                `;
                wrapper.appendChild(slot);
            });

            // 下方“哈希值检验”加号区域点击后，填充与上方一致的文件条目
            if (verifyClick && verifyClick.dataset.bound !== '1') {
                verifyClick.dataset.bound = '1';
                verifyClick.addEventListener('click', () => {
                    const wrapper = verifyClick.parentElement;
                    if (!wrapper) return;
                    if (wrapper.querySelector('.hash-verify-slot')) return;

                    const slot = document.createElement('div');
                    // 复用与上方完全一致的样式
                    slot.className = 'hash-upload-slot';
                    slot.innerHTML = `
                        <div class="file-info">
                            <img src="./images/avatar.png" alt="thumb" width="36" height="36" style="border-radius:6px;" />
                            <div>
                                <div>印尼禽月营销海报（2024）.jpg</div>
                                <div class="file-sub">来自“本地”文件</div>
                            </div>
                        </div>
                        <div class="file-size">32mb</div>
                    `;
                    wrapper.appendChild(slot);
                });
            }

            // 生成按钮当前不再驱动右侧卡片内容（已复原为静态图）
            if (generateBtn) {
                if (generateBtn.dataset.bound === '1') return;
                generateBtn.dataset.bound = '1';
                generateBtn.addEventListener('click', () => {
                    console.log('Hash generate clicked');
                });
            }
        }
        
        // 文化适配检测页面交互功能
        function setupCulturalAdaptationInteractions() {
            const uploadArea = document.getElementById('cultural-upload-area');
            const filePreview = document.getElementById('file-preview');
            const uploadPlaceholder = document.getElementById('upload-placeholder');
            const selectFileBtn = document.getElementById('select-file-btn');
            const detectBtn = document.getElementById('detect-btn');
            const resultsArea = document.getElementById('cultural-adaptation-results');
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.jpg,.jpeg,.png,.pdf';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);

            // 文件上传区域点击事件
            if (uploadArea) {
                uploadArea.addEventListener('click', () => {
                    fileInput.click();
                });

                // 拖拽上传功能
                uploadArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    uploadArea.style.borderColor = '#168AFF';
                    uploadArea.style.backgroundColor = '#F7F9FF';
                });

                uploadArea.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    uploadArea.style.borderColor = '#E6E8F0';
                    uploadArea.style.backgroundColor = 'transparent';
                });

                uploadArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    uploadArea.style.borderColor = '#E6E8F0';
                    uploadArea.style.backgroundColor = 'transparent';
                    
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                        handleFileSelect(files[0]);
                    }
                });
            }

            // 文件选择按钮点击事件
            if (selectFileBtn) {
                selectFileBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    fileInput.click();
                });
            }

            // 文件输入变化事件
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleFileSelect(e.target.files[0]);
                }
            });

            // 一键检测按钮点击事件
            if (detectBtn) {
                detectBtn.addEventListener('click', () => {
                    if (resultsArea) {
                        resultsArea.classList.remove('hidden');
                        
                        // 添加动画效果
                        const cards = resultsArea.querySelectorAll('.result-card');
                        cards.forEach((card, index) => {
                            setTimeout(() => {
                                card.style.opacity = '0';
                                card.style.transform = 'translateY(30px)';
                                card.style.transition = 'all 0.6s ease';
                                
                                setTimeout(() => {
                                    card.style.opacity = '1';
                                    card.style.transform = 'translateY(0)';
                                }, 100);
                            }, index * 200);
                        });
                    }
                });
            }

            // 处理文件选择
            function handleFileSelect(file) {
                if (file) {
                    // 显示文件预览
                    if (filePreview && uploadPlaceholder) {
                        uploadPlaceholder.classList.add('hidden');
                        filePreview.classList.remove('hidden');
                        
                        // 更新文件信息
                        const fileName = filePreview.querySelector('.file-name');
                        const fileSize = filePreview.querySelector('.file-size');
                        
                        if (fileName) {
                            fileName.textContent = file.name;
                        }
                        
                        if (fileSize) {
                            const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
                            fileSize.textContent = sizeInMB + 'mb';
                        }

                        // 如果是图片文件，显示预览
                        if (file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                const previewImage = filePreview.querySelector('.preview-image');
                                if (previewImage) {
                                    previewImage.src = e.target.result;
                                }
                            };
                            reader.readAsDataURL(file);
                        }
                    }
                }
            }

            // AI建议和顾问区域点击事件
            const suggestionItems = document.querySelectorAll('.suggestion-item:not(.more)');
            const regionItems = document.querySelectorAll('.region-item:not(.more)');

            suggestionItems.forEach(item => {
                item.addEventListener('click', () => {
                    const text = item.querySelector('span').textContent;
                    console.log('AI建议点击:', text);
                    // 这里可以添加具体的建议展开逻辑
                });
            });

            regionItems.forEach(item => {
                item.addEventListener('click', () => {
                    const text = item.querySelector('span').textContent;
                    console.log('顾问区域点击:', text);
                    // 这里可以添加跳转到顾问页面的逻辑
                });
            });
        }

        // 初始化文化适配检测页面交互
        setupCulturalAdaptationInteractions();
        
        // 切换聊天窗口函数
        function switchChatWindow(contact) {
            const juliaChatImage = document.querySelector('.julia-chat');
            const jiajianChatImage = document.querySelector('.jiajian-chat');
            
            // 移除所有联系人条目的选中状态
            document.querySelectorAll('#my-consultant-view .contact-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // 添加当前选中联系人的选中状态
            const activeContactItem = document.querySelector(`#my-consultant-view .contact-item[data-contact="${contact}"]`);
            if (activeContactItem) {
                activeContactItem.classList.add('active');
            }
            
            if (contact === 'julia' && juliaChatImage) {
                juliaChatImage.style.display = 'block';
                if (jiajianChatImage) jiajianChatImage.style.display = 'none';
            } else if (contact === 'jiajian' && jiajianChatImage) {
                jiajianChatImage.style.display = 'block';
                if (juliaChatImage) juliaChatImage.style.display = 'none';
            }
        }
});