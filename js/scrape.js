
const puppeteer = require('puppeteer');

const baseUrl = 'https://www.usatoday.com/'

let getData = async () => {
    try{
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
        await page.goto(baseUrl, {waitUntil: 'load', timeout: 0});
        await page.addScriptTag({content: `${getLeftColArticles}`});
        await page.addScriptTag({content: `${getMiddleColArticles}`});
        
        const result = await page.evaluate( () => {
            const allArticles = [];
            const articlesContainer = document.querySelectorAll('.gnt_m_tt_col__fc a');
            const middleArticlesContainer = document.querySelectorAll('.gnt_m_tt_col a');
            const leftArticles = getLeftColArticles(articlesContainer);
            const middleArticles = getMiddleColArticles(middleArticlesContainer);
            
            allArticles.push(leftArticles);
            allArticles.push(middleArticles);
            return allArticles;
        });

        await browser.close();
        return result;

    }catch(err){
        console.log(err);
    }
}


function getLeftColArticles (elem){
    const arr = [];
    elem.forEach(anchor => {
        if(anchor.getAttribute('rel')){
            return;
        } else{
            let articleURl = anchor.getAttribute('href');
            articleURl = 'https://www.usatoday.com' + articleURl;
            const articleImg = anchor.firstElementChild.getAttribute('src');
            const artHeadline = anchor.firstElementChild.nextElementSibling.innerText;
            const artDate = anchor.lastElementChild.getAttribute('data-c-dt');
            
            
            arr.push({
                articleURl,
                articleImg,
                artHeadline,
                artDate
            });
        }
    });

    return arr;
}

function getMiddleColArticles(element){
    const arr = [];
    const articlesAnchors = Array.from(element);
    articlesAnchors.splice(0, 4);

    articlesAnchors.forEach( (el, index) => {
        let articleURl;
        let articleHeadline;
        let artDate;
        let articleImg;

        if(el.firstElementChild){
            articleURl= el.getAttribute('href');
            articleURl = 'https://www.usatoday.com' + articleURl;
            articleHeadline = el.firstElementChild.nextElementSibling.innerText;
            
            if(el.firstElementChild.tagName === 'IMG' && el.lastElementChild.getAttribute('data-c-dt')) {
                articleImg = el.firstElementChild.getAttribute('src');
                artDate = el.lastElementChild.getAttribute('data-c-dt');
            } else{
                articleImg = el.firstElementChild.firstElementChild.getAttribute('src');
                artDate = el.lastElementChild.firstElementChild.getAttribute('data-c-dt');
            }   
        }

        arr.push({
           articleURl,
           articleHeadline,
           artDate,
           articleImg
        })
    });

    
    return arr;
}


module.exports = getData;