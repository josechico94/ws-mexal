// Importiamo i moduli necessari
const express = require('express');       // Framework per creare applicazioni web
const axios = require('axios');           // Client HTTP per effettuare richieste API
const https = require('https');           // Modulo nativo di Node.js per connessioni HTTPS
const path = require('path');             // Modulo per gestire i percorsi dei file

// Inizializziamo l'applicazione Express
const app = express();
const port = 3000;                        // Porta su cui verrà eseguito il server

// Configuriamo Express per usare EJS come motore di template
app.set('view engine', 'ejs');                                      // Impostiamo EJS come motore di visualizzazione
app.set('views', path.join(__dirname, 'views'));                   // Indichiamo la cartella dove si trovano le viste

// Middleware per analizzare i dati nel body delle richieste
app.use(express.urlencoded({ extended: true }));   // Per leggere i dati inviati dai form HTML
app.use(express.json());                          // Per leggere dati JSON nel corpo della richiesta

// Rotta principale GET ('/')
app.get('/', async (req, res) => {
    try {
        // Effettuiamo una richiesta POST all’API per ottenere gli articoli
        const response = await axios.post(
            'https://demo.irisinformatica.com:9015/webshaker/spx/ppt',
            {
                "SiglaAzienda": "ZMB",                   // Codice azienda
                "Sottoazienda": "",                      // Sottoazienda, se presente
                "CodiceApp": "297723JOSE",               // Codice dell'applicazione
                "CodiceAppEst": "",                      // Codice esterno (vuoto)
                "NomeCollage": "artiweb",                // Nome del collage configurato nel sistema
                "NomeEtichetta": "GETARTICOLI",          // Etichetta per ottenere gli articoli
                "Data": "10/03/2025",                    // Data della richiesta
                "cmd": "EseguiEticCollageRemoto",        // Comando da eseguire
                "Client": {
                    "Tipo": "WebShaker",                // Tipo di client
                    "Versione": 1000                    // Versione del client
                },
                "DatiInput": {}                         // Nessun dato di input richiesto
            },
            {
                headers: {
                    'Authorization': 'Passepartout V0VCU0hBS0VSOldFQlNIQUtFUjAy',  // Token di autorizzazione
                    'Content-Type': 'application/json; charset=utf-8'
                },
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false            // Ignora problemi di certificati SSL (solo per test)
                })
            }
        );

        // Otteniamo gli articoli dalla risposta usando l’optional chaining (?.)
        const articoli = response.data.DatiOutput?.articoli || [];

        // Renderizziamo la vista index.ejs passando i dati ricevuti
        res.render('index', { DatiOutput: response.data.DatiOutput, mensaje: null });

    } catch (error) {
        // In caso di errore, mostriamo il messaggio nella console e restituiamo errore 500
        console.error('Errore nella richiesta:', error);
        res.status(500).send('Errore nella richiesta');
    }
});

// Rotta POST per aggiornare gli articoli
app.post('/actualizar', (req, res) => {
    // Mostriamo il contenuto del form ricevuto (utile per debug)
    console.log(req.body); // req.body.articoli dovrebbe contenere un array di articoli

    // Creiamo il corpo della richiesta JSON da inviare all’API
    const data = JSON.stringify({
        "SiglaAzienda": "ZMB",
        "Sottoazienda": "",
        "CodiceApp": "297723JOSE",
        "CodiceAppEst": "",
        "NomeCollage": "artiweb",
        "NomeEtichetta": "UPDARTICOLI",     // Etichetta che indica un aggiornamento
        "Data": "10/04/2025",
        "cmd": "EseguiEticCollageRemoto",
        "Client": {
            "Tipo": "WebShaker",
            "Versione": 1000
        },
        "DatiInput": {
            "articoli": req.body.articoli    // Articoli ricevuti dal form da aggiornare
        }
    });

    // Inviamo la richiesta all’API con i dati aggiornati
    axios.post(
        'https://demo.irisinformatica.com:9015/webshaker/spx/ppt',
        data,
        {
            headers: {
                'Authorization': 'Passepartout V0VCU0hBS0VSOldFQlNIQUtFUjAy',
                'Content-Type': 'application/json; charset=utf-8'
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        }
    )
    .then(response => {
        // Se la richiesta ha successo, renderizziamo la vista con un messaggio di conferma
        res.render('index', {
            DatiOutput: response.data.DatiOutput,
            mensaje: 'Articoli aggiornati correttamente'
        });
    })
    .catch(error => {
        // In caso di errore, lo mostriamo nella console e restituiamo errore 500
        console.error('Errore durante l\'aggiornamento:', error);
        res.status(500).send('Errore durante l\'aggiornamento degli articoli');
    });
});

// Avviamo il server sulla porta specificata
app.listen(port, () => {
    console.log(`Server in esecuzione su http://localhost:${port}`);
});
