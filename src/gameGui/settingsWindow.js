const { QDialog, QComboBox, QLabel, QPushButton, QBoxLayout, QColorDialog ,Direction} = require('@nodegui/nodegui');
const { LocalStorage } = require('node-localstorage');

const localStorage = new LocalStorage('./userdata');

class SettingsWindow {
    constructor(mainWindow) {
		//console.log(mainWindow);

        this.dialog = new QDialog();
        this.dialog.setWindowTitle("设置");
        this.dialog.setFixedSize(300, 100);

        const layout = new QBoxLayout(Direction.TopToBottom);

        // 语言设置
        const langLabel = new QLabel();
        langLabel.setText("选择语言:");
        this.langComboBox = new QComboBox();
        this.langComboBox.addItem(undefined,"中文");
        this.langComboBox.addItem(undefined,"English");
		//console.log(this.langComboBox);



        // 确认按钮
        const saveButton = new QPushButton();
        saveButton.setText("保存设置");
        saveButton.addEventListener("clicked", () => {
            const selectedLang = this.langComboBox.currentText();
            localStorage.setItem("language", selectedLang);
			mainWindow.reinitializeLogic();
            this.dialog.close();
        });

        // 加载已保存的设置
        const savedLang = localStorage.getItem("language");
        if (savedLang) {
            this.langComboBox.setCurrentText(savedLang);
        }

        layout.addWidget(langLabel);
        layout.addWidget(this.langComboBox);
        layout.addWidget(saveButton);
        this.dialog.setLayout(layout);
    }

    show() {
        this.dialog.exec();
    }
}

module.exports = { SettingsWindow };
