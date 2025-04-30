// config.js
// ERPシステムUI分析のための設定ファイル

module.exports = {
  // ERPシステムのベースURL
  baseUrl: 'http://po2.itdo.jp:8000', // 実際のERPシステムURL
  
  // ログイン認証情報
  credentials: {
    username: 'testuser@example.com', // 実際に使用するメールアドレス
    password: 'password123' // 実際のパスワード
  },
  
  // 分析するワークフロー
  workflows: [
    // インボイス作成ワークフロー
    {
      name: 'invoice_creation',
      steps: [
        {
          description: 'ダッシュボードからインボイス作成画面を開く',
          url: '/dashboard',
          action: {
            type: 'click',
            selector: '#create-invoice-button',
            // 代替セレクタ（メインのセレクタが見つからない場合に使用）
            alternativeSelector: '.create-invoice-link'
          },
          waitForNavigation: true
        },
        {
          description: '顧客情報入力',
          action: {
            type: 'input',
            selector: '#customer-name',
            value: 'テスト株式会社'
          }
        },
        {
          description: '金額入力',
          action: {
            type: 'input',
            selector: '#amount',
            value: '150000'
          }
        },
        {
          description: '日付選択',
          action: {
            type: 'input',
            selector: '#date',
            value: '2025-04-30'
          }
        },
        {
          description: 'インボイス保存',
          action: {
            type: 'click',
            selector: '#save-invoice'
          },
          waitForNavigation: true
        }
      ]
    },
    
    // 請求書承認ワークフロー
    {
      name: 'invoice_approval',
      steps: [
        {
          description: '請求書一覧画面に移動',
          url: '/invoices',
          waitForNavigation: true
        },
        {
          description: '最初の請求書を選択',
          action: {
            type: 'click',
            selector: '.invoice-item:first-child'
          },
          waitForNavigation: true
        },
        {
          description: '請求書の詳細を確認',
          action: {
            type: 'wait',
            time: 2000 // 2秒待機
          }
        },
        {
          description: '承認ボタンをクリック',
          action: {
            type: 'click',
            selector: '#approve-button'
          }
        },
        {
          description: '確認ダイアログで「はい」をクリック',
          action: {
            type: 'click',
            selector: '.confirmation-dialog .yes-button'
          },
          waitForNavigation: true
        }
      ]
    },
    
    // 在庫管理ワークフロー
    {
      name: 'inventory_management',
      steps: [
        {
          description: '在庫管理画面に移動',
          url: '/inventory',
          waitForNavigation: true
        },
        {
          description: '新規アイテム追加ボタンをクリック',
          action: {
            type: 'click',
            selector: '#add-item-button'
          },
          waitForNavigation: true
        },
        {
          description: '商品名を入力',
          action: {
            type: 'input',
            selector: '#item-name',
            value: 'テスト商品'
          }
        },
        {
          description: '商品コードを入力',
          action: {
            type: 'input',
            selector: '#item-code',
            value: 'TST-001'
          }
        },
        {
          description: '在庫数を入力',
          action: {
            type: 'input',
            selector: '#item-quantity',
            value: '100'
          }
        },
        {
          description: '単価を入力',
          action: {
            type: 'input',
            selector: '#item-price',
            value: '1500'
          }
        },
        {
          description: 'カテゴリを選択',
          action: {
            type: 'select',
            selector: '#item-category',
            value: 'electronics' // セレクトボックスの値
          }
        },
        {
          description: '保存ボタンをクリック',
          action: {
            type: 'click',
            selector: '#save-item'
          },
          waitForNavigation: true
        }
      ]
    }
  ],
  
  // 出力設定
  output: {
    // 出力ディレクトリ
    baseDir: './erp_capture',
    
    // 収集するデータタイプ
    capture: {
      screenshot: true,
      html: true,
      styles: true,
      dom: true,
      accessibility: true
    },
    
    // 分析オプション
    analysis: {
      componentUsage: true,
      styleConsistency: true,
      accessibility: true,
      generateFlowDiagram: true
    }
  }
};