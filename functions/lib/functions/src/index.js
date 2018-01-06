"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmailEmail,
        pass: gmailPassword
    }
});
exports.sendEmailConfirmation = functions.https.onRequest((req, res) => {
    var text = '';
    admin.firestore().collection('matchdays', ref => ref.orderBy('date', 'asc')).snapshotChanges()
        .map(actions => {
        return actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, data };
        });
    }).subscribe(md => {
        text = JSON.stringify(md, null, 2);
        const mailOptions = {
            from: 'somme@gmail.com',
            to: 'somme82@gmail.com',
            subject: 'Backup',
            text: text
        };
        return mailTransport.sendMail(mailOptions)
            .then(() => console.log(`New ${''}subscription confirmation email sent to:`, 'somme82@gmail.com'))
            .catch(error => console.error('There was an error while sending the email:', error));
    });
});
exports.getEnvironmentConfiguration = functions.https.onRequest((req, res) => {
    return {
        gmailEmail: gmailEmail,
        gmailPassword: gmailPassword
    };
});
//# sourceMappingURL=index.js.map