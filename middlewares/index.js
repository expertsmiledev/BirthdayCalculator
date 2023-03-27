import bodyParser from 'body-parser'
import helmet from 'helmet'
import multer from 'multer'

var upload = multer();

const setGlobelMiddleware = app => {
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(bodyParser.text({ type: "application/x-ndjson" }));
    app.use(upload.array());
    app.use(helmet());
    app.use(helmet.xssFilter())
    app.disable("x-powered-by");

    const sixtyDaysInSeconds = 5184000;
    app.use(
        helmet.hsts({
            maxAge: sixtyDaysInSeconds
        })
    );
};

export default setGlobelMiddleware;