function checkForEmptyArticles(arr){
    const newArticlesArr = [];
    arr.forEach((item) => {
        if(Object.keys(item).length !== 0){
            newArticlesArr.push(item);
        } 
    });

    return newArticlesArr;
}

module.exports = checkForEmptyArticles;