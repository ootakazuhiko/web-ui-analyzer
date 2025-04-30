// ecommerce-flow.js
// Eコマースサイトの標準的な購入フローのサンプル実装

const path = require('path');
const { captureWorkflow } = require('../../src/capture/playwright');
const { runAnalysis } = require('../../src/analysis/analyze');

// サンプルEコマースサイトURL（実際のURLに変更してください）
const DEMO_ECOMMERCE_URL = 'https://demo.opencart.com/';

/**
 * Eコマースサイトの基本的な購入フローを自動実行します
 * このサンプルは、手動操作版のUIキャプチャツールの使用方法を示しています
 */
async function runEcommerceFlow() {
  console.log('=== Eコマース購入フローのサンプル実行 ===');
  console.log(`サイト: ${DEMO_ECOMMERCE_URL}`);
  
  // ワークフロー名
  const workflowName = 'ecommerce_purchase_flow_' + 
    new Date().toISOString().replace(/[:.]/g, '-');
  
  try {
    // ワークフロー実行（手動操作モード）
    const result = await captureWorkflow(DEMO_ECOMMERCE_URL, workflowName);
    
    if (result.success) {
      console.log(`\n商品購入フローの収集が完了しました (${result.stepCount}ステップ)`);
      console.log(`データは ${result.outputDir} に保存されました`);
      
      // 分析実行
      await runAnalysis(result.outputDir);
      
      console.log('\n分析完了');
      console.log('\n===== ヒント =====');
      console.log('1. 手順ごとのスクリーンショットは各ステップの _screenshot.png ファイルを確認してください');
      console.log('2. UI要素の使用状況は component_usage.json と component_usage.csv を確認してください');
      console.log('3. スタイル一貫性の分析は consistency_report.md を確認してください');
      console.log('4. アクセシビリティの問題は accessibility_report.md を確認してください');
      console.log('5. パフォーマンス分析は performance_report.md を確認してください');
      console.log(`6. トレースを見るには: npx playwright show-trace ${path.join(result.outputDir, 'trace.zip')}`);
    } else {
      console.error('ワークフローの実行中にエラーが発生しました:', result.error);
    }
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// このスクリプトが直接実行された場合は実行する
if (require.main === module) {
  runEcommerceFlow().catch(console.error);
}

module.exports = { runEcommerceFlow };