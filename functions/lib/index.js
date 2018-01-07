"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cors = require('cors')({ origin: true });
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmailEmail,
        pass: gmailPassword
    }
});
exports.getEnvironmentConfiguration = functions.https.onRequest((req, res) => {
    var mailConfig = {
        gmailEmail: gmailEmail,
        gmailPassword: gmailPassword
    };
    res.status(200).send(mailConfig);
});
exports.sendMail = functions.https.onRequest((req, res) => {
    if (req.method === 'PUT') {
        res.status(403).send('Forbidden!');
    }
    cors(req, res, () => {
        var date = new Date();
        const mailOptions = {
            from: 'somme@gmail.com',
            to: 'somme82@gmail.com',
            subject: 'Backup Friday Night firestore',
            text: 'Backup Friday Night firestore',
            attachments: [
                {
                    filename: 'fnpc-backup-' + date.getFullYear() + '-' + date.getMonth() + '-' + date.getDay() + '.txt',
                    content: req.body.text
                }
            ]
        };
        mailTransport.sendMail(mailOptions)
            .then(() => console.log(`New ${''}subscription confirmation email sent to:`, 'somme82@gmail.com'))
            .catch(error => console.error('There was an error while sending the email:', error));
        res.status(200).send('email erfolgreich gesendet!');
    });
});
//# sourceMappingURL=index.js.map