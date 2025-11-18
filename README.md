# 飛行棋遊戲

## 專案簡介
這是一個基於React開發的飛行棋遊戲，提供單人與AI對戰功能，包含完整的遊戲邏輯與互動介面。遊戲採用現代前端技術棧，具有流暢的使用體驗和美觀的介面設計。

## 功能特色
- ✅ 完整的飛行棋遊戲規則實現
- 🤖 AI對手採用蒙特卡洛樹搜索(MCTS)算法
- 🎮 遊戲狀態即時顯示與動畫效果
- 🎲 互動式骰子投擲效果
- 🏆 勝利畫面顯示
- 📊 玩家狀態網格顯示
- 📝 操作記錄面板

## 安裝步驟
1. 確保已安裝Node.js (建議版本16或以上)
2. 克隆專案到本地：
   ```bash
   git clone https://github.com/your-repo/flying-chess.git
   cd flying-chess
   ```
3. 安裝依賴套件：
   ```bash
   npm install
   ```
4. 啟動開發伺服器：
   ```bash
   npm run dev
   ```
5. 開啟瀏覽器訪問 http://localhost:5173 開始遊戲

## 使用說明
1. 點擊骰子圖示開始投擲
2. 根據骰子結果選擇要移動的棋子
3. 與AI對手輪流進行遊戲
4. 擊敗AI贏得勝利
5. 遊戲結束後可點擊重新開始按鈕

## 專案結構
```
flying-chess/
├── src/
│   ├── engine/          # 遊戲引擎與AI邏輯
│   │   ├── gameEngine.js
│   │   ├── gameAI.js
│   │   └── MCTSNode.js
│   ├── test/           # 測試檔案
│   ├── components/     # React元件
│   └── assets/        # 靜態資源
├── public/            # 公開資源
└── vite.config.js     # Vite配置
```

## 技術棧
- **前端框架**: React 18
- **建構工具**: Vite
- **樣式**: CSS3
- **AI算法**: 蒙特卡洛樹搜索(MCTS)
- **開發語言**: JavaScript

## 開發指令
```bash
# 啟動開發伺服器
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview

# 執行測試
npm test

# 程式碼檢查
npm run lint
```

## 授權協議
MIT License

## 聯絡方式
如有任何問題或建議，請透過GitHub Issues提交。