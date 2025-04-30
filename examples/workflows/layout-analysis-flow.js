// layout-analysis-flow.js
// Layout Analysis Specialized Workflow Sample (English & Japanese)

const path = require('path');
const { captureWorkflow } = require('../../src/capture/playwright');
const { runAnalysis } = require('../../src/analysis/analyze');

// Sample web app URL (please change to an actual URL)
const DEMO_WEBAPP_URL = 'https://getbootstrap.com/docs/5.0/examples/dashboard/';

// Text resources for internationalization
const texts = {
  en: {
    title: '=== Layout Analysis Specialized Workflow Sample Execution ===',
    site: `Site: ${DEMO_WEBAPP_URL}`,
    completion: `\nLayout analysis flow collection completed ({0} steps)`,
    dataSaved: `Data has been saved to {0}`,
    analysisComplete: '\nAnalysis completed',
    perspectiveTitle: '\n===== Layout Analysis Perspectives =====',
    perspectives: [
      '1. Check color_usage.json to verify color palette consistency',
      '2. Check font_size_usage.json to verify typography hierarchy',
      '3. Check consistency_report.md for an overview of style consistency',
      '4. Check component_usage.csv for UI component statistics',
      '5. Check the _layout.json files for each step for detailed element layout information',
      '6. Visual confirmation with the trace viewer: npx playwright show-trace {0}'
    ],
    workflowError: 'An error occurred during workflow execution:',
    generalError: 'An error occurred:'
  },
  ja: {
    title: '=== レイアウト分析特化ワークフローのサンプル実行 ===',
    site: `サイト: ${DEMO_WEBAPP_URL}`,
    completion: `\nレイアウト分析フローの収集が完了しました ({0}ステップ)`,
    dataSaved: `データは {0} に保存されました`,
    analysisComplete: '\n分析完了',
    perspectiveTitle: '\n===== レイアウト分析の視点 =====',
    perspectives: [
      '1. color_usage.json を確認して、カラーパレットの一貫性を検証',
      '2. font_size_usage.json を確認して、タイポグラフィの階層を検証',
      '3. consistency_report.md でスタイルの一貫性の全体像を確認',
      '4. component_usage.csv でUIコンポーネントの統計を確認',
      '5. 各ステップの _layout.json ファイルで要素の配置情報を詳細に確認',
      '6. トレースビューアで視覚的に確認: npx playwright show-trace {0}'
    ],
    workflowError: 'ワークフローの実行中にエラーが発生しました:',
    generalError: 'エラーが発生しました:'
  }
};

/**
 * Execute a workflow specialized for layout analysis of web applications
 * This sample demonstrates a manual operation workflow for efficiently analyzing
 * layout consistency and component usage
 * 
 * @param {string} lang - Language code ('en' or 'ja')
 */
async function runLayoutAnalysisFlow(lang = 'en') {
  // Validate and set language
  const language = ['en', 'ja'].includes(lang) ? lang : 'en';
  const t = texts[language];
  
  console.log(t.title);
  console.log(t.site);
  
  // Workflow name
  const workflowName = 'layout_analysis_flow_' + 
    new Date().toISOString().replace(/[:.]/g, '-');
  
  try {
    // Browser settings optimized for layout analysis
    const options = {
      headless: false,
      viewportSize: { width: 1920, height: 1080 } // Large screen for detailed view
    };
    
    // Execute workflow
    const result = await captureWorkflow(DEMO_WEBAPP_URL, workflowName, options);
    
    if (result.success) {
      console.log(t.completion.replace('{0}', result.stepCount));
      console.log(t.dataSaved.replace('{0}', result.outputDir));
      
      // Run analysis
      await runAnalysis(result.outputDir);
      
      console.log(t.analysisComplete);
      console.log(t.perspectiveTitle);
      
      // Display perspective points
      t.perspectives.forEach(perspective => {
        if (perspective.includes('{0}')) {
          console.log(perspective.replace('{0}', path.join(result.outputDir, 'trace.zip')));
        } else {
          console.log(perspective);
        }
      });
    } else {
      console.error(t.workflowError, result.error);
    }
  } catch (error) {
    console.error(t.generalError, error);
  }
}

// Execute if this script is run directly
if (require.main === module) {
  // Check for language parameter
  const args = process.argv.slice(2);
  const lang = args[0] === 'ja' ? 'ja' : 'en';
  
  runLayoutAnalysisFlow(lang).catch(console.error);
}

module.exports = { runLayoutAnalysisFlow };