# Web UI Analyzer

Web UI Analyzerは、Webシステムのユーザーインターフェースを手動操作しながら各画面の情報を収集・分析するツールです。UIの一貫性、アクセシビリティ、コンポーネント使用状況などを効率的に分析し、より良いWebインターフェースの設計に役立ちます。

## 主な機能

- **WebUI操作の記録と分析**: 手動操作による画面遷移をキャプチャし、詳細に分析します
- **多角的なデータ収集**: HTML構造、CSS情報、DOM構造、アクセシビリティ情報などを自動収集
- **詳細な分析レポート**: コンポーネント使用状況、スタイル一貫性、アクセシビリティなどの分析レポートを自動生成
- **Playwrightトレース機能**: ブラウザ操作の全過程を記録し、後から詳細に分析できます（Playwright版）
- **複数のブラウザ対応**: PlaywrightとPuppeteer両バージョンを提供

## 前提条件

- Node.js (v14以上)
- npm または yarn

## インストール

```bash
git clone https://github.com/あなたのユーザー名/web-ui-analyzer.git
cd web-ui-analyzer
npm install
```

## 使い方

### 基本的な実行

```bash
# Playwright版
node src/capture/playwright.js

# Puppeteer版
node src/capture/puppeteer.js
```

### サンプルワークフロー

サンプルワークフロー選択メニューを使用して、様々な分析例を試すことができます：

```bash
node examples/workflows/index.js
```

以下の3種類のサンプルワークフローが含まれています：

1. **Eコマースサイト購入フロー**: 商品選択から購入までの典型的な流れを分析
2. **レイアウト分析特化ワークフロー**: UIの一貫性やレイアウトパターンを詳細に分析
3. **アクセシビリティ監査ワークフロー**: アクセシビリティ問題の検出に重点を置いた分析

## 設定

`config/default.js`ファイルで分析対象のWebサイトURLなどを設定できます：

```javascript
module.exports = {
  baseUrl: 'http://your-web-system.com', // 分析対象のWebサイトURL
  // その他の設定...
};
```

## 分析結果

分析結果は以下のディレクトリに保存されます：

- Playwright版: `captures_pw/<ワークフロー名>/`
- Puppeteer版: `captures/<ワークフロー名>/`

各ディレクトリには以下のファイルが含まれます：

- スクリーンショット
- HTML構造
- スタイル情報
- DOM/レイアウト情報
- アクセシビリティ情報
- 分析レポート

## トレース機能の活用

Playwright版で収集されたトレースデータは、Playwrightのトレースビューアで開くことができます：

```bash
npx playwright show-trace captures_pw/<ワークフロー名>/trace.zip
```

## 詳細ドキュメント

詳細な使用方法とカスタマイズについては、[使用手順書](docs/usage.md)を参照してください。

## 特徴

### Playwright版の特徴

- 複数のブラウザエンジン（Chromium、Firefox、WebKit）に対応
- トレース機能により、セッション全体の詳細な記録が可能
- 自動待機機能がより洗練されている
- 要素レイアウト情報がより詳細

### Puppeteer版の特徴

- より軽量で、Chromeブラウザのみに対応
- DOM構造のより詳細なスナップショットを提供
- 多くの環境ですぐに動作する

## ライセンス

MIT

## 貢献

バグレポート、機能提案、プルリクエストなど、あらゆる形での貢献を歓迎します。