const cron = require('node-cron');
const nodemailer = require('nodemailer');
const db = require('../models'); 
const { Op } = require('sequelize'); 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
       
        rejectUnauthorized: false 
    }
});

const proveriISaljiPodsetnike = async () => {
    console.log('--- Provera rokova za mejlove pokrenuta ---');
    try {
       
        const danas = new Date();
        const ciljniDatum = new Date();
        ciljniDatum.setDate(danas.getDate() + 3);
        

        const pocetakDana = new Date(ciljniDatum.setHours(0, 0, 0, 0));
        const krajDana = new Date(ciljniDatum.setHours(23, 59, 59, 999));

        const zaduzenja = await db.Zaduzenje.findAll({
            where: {
                status: 'Aktivno',
                datumVracanja: {
                    [Op.between]: [pocetakDana, krajDana]
                }
            },
            include: [
                { model: db.Publikacija, as: 'publikacija' },
                { model: db.Student, as: 'student' }
            ]
        });

        for (const z of zaduzenja) {
            if (z.student && z.student.email) {
                await transporter.sendMail({
                    from: `"Univerzitetska čitaonica" <${process.env.EMAIL_USER}>`,
                    to: z.student.email,
                    subject: 'Podsetnik: Rok za knjigu ističe za 3 dana',
                    text: `Zdravo ${z.student.ime}, tvoj rok za knjigu "${z.publikacija.naziv}" ističe ${z.datumVracanja.toLocaleDateString('sr-RS')}`
                });
                console.log(`Mejl poslat za: ${z.student.email}`);
            }
        }
    } catch (error) {
        console.error('Greška u email servisu:', error);
    }
};


const startCron = () => {
    cron.schedule('0 9 * * *', () => {
        proveriISaljiPodsetnike();
    }, {
        timezone: "Europe/Belgrade"
    });
};

const testirajSlanjeDirektno = async (adresa) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: adresa,
        subject: 'Test iz Čitaonice',
        text: 'Ako vidiš ovo, tvoj Gmail i Docker su super povezani!'
    });
};

module.exports = { startCron, proveriISaljiPodsetnike, testirajSlanjeDirektno };
//module.exports = { startCron, proveriISaljiPodsetnike };