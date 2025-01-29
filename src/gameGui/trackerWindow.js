const {
    QMainWindow,
    QLabel,
    QWidget,
    QScrollArea,
    QBoxLayout,
    Direction,
    CursorShape,
    WidgetEventTypes,
    QPixmap,
    WindowType
} = require('@nodegui/nodegui');
const axios = require('axios');

class TrackerWindow {
     constructor() {
        this.window = new QMainWindow();
        this.window.setWindowTitle('waterstone - 记牌窗口');
        this.window.setMinimumSize(250, 800);
        this.window.setWindowFlag(WindowType.WindowStaysOnTopHint, true);
        this.window.setWindowFlag(WindowType.WindowCloseButtonHint, false);
        this.cardsData = [];
        this.cardImageCache=new Map();
		this.lang='enUS';

        const centralWidget = new QWidget();
        centralWidget.setObjectName('root');
        const rootLayout = new QBoxLayout(Direction.TopToBottom);
        centralWidget.setLayout(rootLayout);

        // **卡牌图像显示区域**
        const topContainer = new QWidget();
        const topLayout = new QBoxLayout(Direction.LeftToRight);
        topContainer.setLayout(topLayout);

        this.cardImageLabel = new QLabel();
        this.cardImageLabel.setObjectName('cardImageLabel');
        this.cardImageLabel.setText('悬浮查看卡牌图像');
        this.cardImageLabel.setFixedSize(128, 194);
        this.cardImageLabel.setAlignment(1);

        // **胜率文本**
        this.winRateLabel = new QLabel();
        this.winRateLabel.setObjectName('winRateLabel');
        this.winRateLabel.setText('');
        this.winRateLabel.setFixedSize(100, 50);
        this.winRateLabel.setAlignment(1);

        topLayout.addWidget(this.cardImageLabel);
        topLayout.addWidget(this.winRateLabel);

        // **滚动区域**
        this.scrollArea = new QScrollArea();
        this.scrollArea.setWidgetResizable(true);

        // **卡牌列表区域**
        this.cardListContainer = new QWidget();
        const cardListLayout = new QBoxLayout(Direction.TopToBottom);
        this.cardListContainer.setLayout(cardListLayout);
        this.cardListContainer.setObjectName('cardListContainer');

        this.scrollArea.setWidget(this.cardListContainer);

        // **添加到布局**
        rootLayout.addWidget(topContainer);
        rootLayout.addWidget(this.scrollArea);
        this.window.setCentralWidget(centralWidget);

        // **加载样式**
        this.window.setStyleSheet(`
            #root {
                background-color: #f0f0f0;
                padding: 20px;
            }
            #cardListContainer {
                background-color: #ffffff;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 8px;
            }
            #cardImageLabel {
                background-color: #eaeaea;
                border: 1px dashed #aaa;
                margin-bottom: 10px;
            }
            #winRateLabel {
                font-size: 10px;
                color: #007bff;
                margin-left: 5px;
            }
        `);
    }

    updateDeckCards(cardNames) {
            try {
                // **清空原有内容**
                this.cardListContainer.close();
                this.scrollArea.takeWidget();
    
                // **创建新的 cardListContainer**
                this.cardListContainer = new QWidget();
                const cardListLayout = new QBoxLayout(Direction.TopToBottom);
                this.cardListContainer.setLayout(cardListLayout);
                this.cardListContainer.setObjectName('cardListContainer');
    
                cardNames.forEach((cardName) => {
                    const cardLabel = new QLabel();
                    cardLabel.setText(cardName);
                    cardLabel.setObjectName('cardLabel');
                     cardLabel.setStyleSheet(`
                                        padding: 8px;
                                        font-size: 15px;
                                        background-color: #fff;
                                        border: 2px solid #007bff;
                                        border-radius: 6px;
                                        margin-bottom: 5px;
                                        transition: all 0.2s;
                                    `);
                    cardLabel.setCursor(CursorShape.PointingHandCursor);
    
                    cardLabel.addEventListener(WidgetEventTypes.Enter, async () => {
                        this.cardImageLabel.setText('加载中…');
    
                        // **优先从缓存获取**
                        if (this.cardImageCache.has(cardName)) {
                            this.cardImageLabel.setPixmap(this.cardImageCache.get(cardName));
                            this.cardImageLabel.setScaledContents(true);
                            return;
                        }
    
                        // **缓存没有时才去请求**
                        const card = this.cardsData.find((i) => i.name === cardName);
                        if (!card) {
                            this.cardImageLabel.setText('图像加载失败');
                            return;
                        }
    
                        const imageUrl = `https://art.hearthstonejson.com/v1/render/latest/${this.lang}/256x/${card.id}.png`;
                        const pixmap = await this.loadImageFromUrl(imageUrl);
    
                        if (pixmap) {
                            this.cardImageLabel.setPixmap(pixmap);
                            this.cardImageLabel.setScaledContents(true);
                            this.cardImageCache.set(cardName, pixmap); // **存入缓存**
                        } else {
                            this.cardImageLabel.setText('图像加载失败');
                        }
                    });
    
                    cardLabel.addEventListener(WidgetEventTypes.Leave, () => {
                        this.cardImageLabel.setText('悬浮查看卡牌图像');
                    });
    
                    cardListLayout.addWidget(cardLabel);
                });
    
                // **重新设置 scrollArea 的 widget**
                this.scrollArea.setWidget(this.cardListContainer);
            } catch (e) {
                console.error(e);
            }
        }


    async loadImageFromUrl(url) {
        try {
            const { data } = await axios.get(url, { responseType: 'arraybuffer' });
            const pixmap = new QPixmap();
            pixmap.loadFromData(data);
            return pixmap;
        } catch (error) {
            console.error(`图片加载失败: ${url}`, error);
            return null;
        }
    }

    show() {
        this.window.show();
    }

    close() {
        this.window.close();
    }
}

module.exports = { TrackerWindow };
