const {
	QMainWindow,
	QLabel,
	QTextEdit,
	QPushButton,
	QWidget,
	QIcon,
	FlexLayout,
	WidgetEventTypes
} = require('@nodegui/nodegui');
const {
	TrackerWindow
} = require('./trackerWindow');
const {
	SettingsWindow
} = require('./settingsWindow');
const logic = require('../gameLogic/main.js');
const {
	LocalStorage
} = require('node-localstorage');
const path = require('path');
const localStorage = new LocalStorage('./userdata');
class MainWindow {
	constructor() {
		this.trackerWindow = new TrackerWindow();
		this.window = new QMainWindow();
		this.window.setWindowTitle('waterstone - 主窗口');
		this.window.setMinimumSize(640, 480);


		const iconPath = path.resolve(__dirname, '../assets/icon.svg'); //设置图标
		const icon = new QIcon(iconPath);
		this.window.setWindowIcon(icon);

		const centralWidget = new QWidget();
		centralWidget.setObjectName('root');
		const rootLayout = new FlexLayout();
		centralWidget.setLayout(rootLayout);

		const label = new QLabel();
		label.setText('WaterStone');
		label.setObjectName('title');

		// 设置按钮
		const settingsButton = new QPushButton();
		settingsButton.setText("⚙ 设置");
		settingsButton.setObjectName('settingsButton');
		settingsButton.addEventListener('clicked', () => {
			const settingsWindow = new SettingsWindow(this);
			settingsWindow.show();
		});

		this.messageLabel = new QTextEdit();
		this.messageLabel.setText('Logs:');
		this.messageLabel.setFontWeight(15);
		this.messageLabel.setReadOnly(true);

		this.deckLabel = new QTextEdit();
		this.deckLabel.setFontWeight(15);
		this.deckLabel.setReadOnly(true);
		this.updateRecord();

		const notice = new QLabel();
		notice.setText('notice:请在waterstone加载完毕后再匹配对手');
		notice.setStyleSheet('font-size:10px;color:red;');


		rootLayout.addWidget(label);
		rootLayout.addWidget(this.messageLabel);
		rootLayout.addWidget(notice);
		rootLayout.addWidget(this.deckLabel);
		rootLayout.addWidget(settingsButton);
		this.window.setCentralWidget(centralWidget);


		this.startLogicListener();

		// 加载样式
		this.window.setStyleSheet(`
      #root {
        background-color: #f0f0f0;
        padding: 20px;
      }
      #title {
        font-size: 24px;
        color: #333;
      }
      #startButton {
        background-color: #007bff;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
      }
    `);
	}

	updateRecord() {
		this.deckLabel.setText('All Deck Record:');
		const decks = JSON.parse(localStorage.getItem('alldeckrate'));
		for (let id in decks) {
			this.deckLabel.append(`${decks[id].name}-${id}:${decks[id].win}/${decks[id].lost}`);
		}
	}

	reinitializeLogic(newLang) {
		console.log(`Reinitializing logic with language: ${newLang}`);
		this.messageLabel.append(`Reinitializing logic with language: ${newLang}`);
		logic.LangDetect();
		logic.initialize();//重新加载卡牌数据
	}

	startLogicListener() {
		logic.startListening();
		logic.on('showMessage', (msg) => {
			this.messageLabel.append(msg);
		});
		logic.on('init', (cardsData, lang) => {
			this.trackerWindow.cardsData = cardsData;
			this.trackerWindow.lang = lang;
			//console.log('卡牌数据已加载');
		});
		logic.on('gameStart', (deckCards, currentRate) => {
			this.openTrackerWindow();
			//console.log(deckCards);
			this.trackerWindow.updateDeckCards(deckCards);
			this.trackerWindow.winRateLabel.setText(
				`套牌胜率:${currentRate.win}/${currentRate.lost} ${(currentRate.win/(currentRate.win+currentRate.lost)).toFixed(2)*100}%`
			);
		});
		logic.on('update', (deckCards) => {
			this.trackerWindow.updateDeckCards(deckCards);
		});
		logic.on('gameOver', (gameover) => {
			this.closeTrackerWindow();
			this.trackerWindow = new TrackerWindow();
			this.updateRecord();
		});
	}

	openTrackerWindow() {
		this.trackerWindow.show();
	}

	closeTrackerWindow() {
		this.trackerWindow.close();
	}

	show() {
		this.window.show();
	}
}

module.exports = {
	MainWindow
};