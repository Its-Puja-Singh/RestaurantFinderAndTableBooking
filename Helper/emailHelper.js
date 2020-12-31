const sgMail = require('@sendgrid/mail');
const { MAIL_KEY, MAIL_ID, URL } = require('../config/keys');

sgMail.setApiKey(MAIL_KEY);

module.exports = {
  sendEmail: async data => {
    const msg = {
      to: data.receiver,
      from: MAIL_ID,
      templateId: data.templateId,
      dynamic_template_data: {
        userName: data.name,
        verificationUrl: `${URL}${data.token}`,
      },
    };
    debug(msg);
    sgMail.send(msg).then(() => debug('Email Sent'));
    return true;
  },
};
