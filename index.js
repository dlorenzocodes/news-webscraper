const path = require('path');
const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2
const hbs = require('nodemailer-express-handlebars');
const scrapedWebsiteData = require('./js/scrape');
const checkForEmptyArticles = require('./js/checkArticles');



let leftCol = [];
let rightCol = [];


// gets articles
scrapedWebsiteData()
    .then((result) => {
        const checkedLeftArt = checkForEmptyArticles(result[0]);
        const checkedMiddleArt = checkForEmptyArticles(result[1]);
        leftCol.push(...checkedLeftArt);
        rightCol.push(...checkedMiddleArt);
    })
    .then(() => getAccessToken)
    .then(() => sendEmail)
    .catch(err => console.log(err));



// email authorization
const OAuth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

OAuth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
});

async function getAccessToken(){
    try{
        const accessToken = await OAuth2Client.getAccessToken();
        return accessToken;
    }catch(err){
        console.log(err);
    }
}


// email template options
const handlebarOptions ={
    viewEngine:{
        partialsDir: path.resolve('./view'),
        defaultLayout: false
    },
    viewPath: path.resolve('./view'),
    extName: '.handlebars'
}

// email scheduled
const sendEmail = cron.schedule('* * * * *', async () => {
    return await emailArticlesTemplate(leftCol, rightCol);
})



// send email function
async function emailArticlesTemplate(leftArt, rightArt){
    const accessToken = await getAccessToken();

    // nodemailer transporter
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: 'OAuth2',
            user: process.env.ACCOUNT_USER, 
            clientId:  process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken
        },
    });

    const mailOptions = {
        from: process.env.ACCOUNT_USER,
        to: process.env.ACCOUNT_USER,
        subject: 'Your News for Today!',
        template: 'email',
        context: {
            articleOneimg: `${leftArt[0].articleImg}`,
            articleOneheadline: `${leftArt[0].artHeadline}`,
            articleOneUrl: `${leftArt[0].articleURl}`,
            articleOneDate: `${leftArt[0].artDate}`,
            articleTwoImg: `${leftArt[1].articleImg}`,
            articleTwoheadline: `${leftArt[1].artHeadline}`,
            articleTwoUrl: `${leftArt[1].articleURl}`,
            articleTwoDate: `${leftArt[1].artDate}`,
            articleThreeImg: `${leftArt[2].articleImg}`,
            articleThreeheadline: `${leftArt[2].artHeadline}`,
            articleThreeUrl: `${leftArt[2].articleURl}`,
            articleThreeDate: `${leftArt[2].artDate}`,
            articleFourimg: `${rightArt[0].articleImg}`,
            articleFourheadline: `${rightArt[0].articleHeadline}`,
            articleFourUrl: `${rightArt[0].articleURl}`,
            articleFourDate: `${rightArt[0].artDate}`,
            articleFiveimg: `${rightArt[1].articleImg}`,
            articleFiveheadline: `${rightArt[1].articleHeadline}`,
            articleFiveUrl: `${rightArt[1].articleURl}`,
            articleFiveDate: `${rightArt[1].artDate}`,
            articleSiximg: `${rightArt[2].articleImg}`,
            articleSixheadline: `${rightArt[2].articleHeadline}`,
            articleSixUrl: `${rightArt[2].articleURl}`,
            articleSixDate: `${rightArt[2].artDate}`,
            articleSevenimg: `${rightArt[3].articleImg}`,
            articleSevenheadline: `${rightArt[3].articleHeadline}`,
            articleSevenUrl: `${rightArt[3].articleURl}`,
            articleSevenDate: `${rightArt[3].artDate}`,
        }
    }

    transporter.use('compile', hbs(handlebarOptions));
    transporter.sendMail(mailOptions, (err, info) => {
        if(err){
            console.log(err);
        } else {
            console.log(`Email sent: ${info.response}`);
        }
    })

}

const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));