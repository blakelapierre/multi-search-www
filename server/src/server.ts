const puppeteer = require('puppeteer');

const document: any = {};

export default async () => {
  const browser = await puppeteer.launch();

  await Promise.all(search('test', browser));
};

function search(query, browser) {
  return engines.map(async ({name, queryUrl, evaluator}) => {
    const page = await browser.newPage();
    
    page.on('console', ({args}) => console.log(`${name} console: ${args.join(' ')}`));

    await page.goto(`${queryUrl}${encodeURI(query)}`);
    
    const results = await page.evaluate(evaluator);
  
    const resultsToPrint = 2;
    console.log(`${name}\n`);
    if (results) console.log(`  ${results.slice(0, resultsToPrint).map(result => `${result.titles[0]} (${result.url})\n    ${result.snippet}`).join('\n\n  ')}\n`);
  
    await page.close();
  });
}

class Engine {
  constructor(public name, public queryUrl, public evaluator) { }
}

const Google = new Engine('Google','https://google.com/search?q=', googleEvaluator),
      DuckDuckGo = new Engine('DuckDuckGo', 'https://duckduckgo.com?q=', duckduckgoEvaluator),
      Bing = new Engine('Bing', 'https://bing.com?q=', bingEvaluator),
      Yahoo = new Engine('Yahoo', 'https://search.yahoo.com/search?p=', yahooEvaluator),

      engines = [ Google, DuckDuckGo, Bing, Yahoo ];

function googleEvaluator() {
  const results = document.querySelectorAll('.srg > .g');

  return Array.prototype.reduce.call(results, (agg, result, i) => agg.concat({
    titles: Array.prototype.reduce.call(result.querySelectorAll('.r'), (agg, result, i) => agg.concat(result.innerText), []),
    snippet: result.querySelector('.rc .s .st').innerText,
    url: result.querySelector('.rc .r a').getAttribute('href')
  }), []);
}

function duckduckgoEvaluator() {
  const results = document.querySelectorAll('#links.results > .result.results_links_deep');
  
  return Array.prototype.reduce.call(results, (agg, result, i) => agg.concat({
    titles: Array.prototype.reduce.call(result.querySelectorAll('.result__title > *:not(.result__check)'), (agg, result, i) => agg.concat(result.innerText), []),
    snippet: result.querySelector('.result__snippet').innerText,
    url: result.querySelector('.result__url').getAttribute('href')
  }), []);
}

function bingEvaluator() {
  const results = document.querySelectorAll('#b_results .b_algo');
  
  return Array.prototype.reduce.call(results, (agg, result, i) => agg.concat({
    titles: Array.prototype.reduce.call(result.querySelectorAll('h2 > a'), (agg, result, i) => agg.concat(result.innerText), []),
    snippet: (result.querySelector('.b_caption p') || {}).innerText,
    url: result.querySelector('h2 > a').getAttribute('href')
  }), []);
}

function yahooEvaluator() {
  const results = document.querySelectorAll('.dd.algo.algo-sr');
  
  return Array.prototype.reduce.call(results, (agg, result, i) => agg.concat({
    titles: Array.prototype.reduce.call(result.querySelectorAll('.title > a'), (agg, result, i) => agg.concat(result.innerText), []),
    snippet: (result.querySelector('.compText p') || {}).innerText,
    url: result.querySelector('.title > a').getAttribute('href')
  }), []);
}