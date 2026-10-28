const express = require('express');
const supa = require('@supabase/supabase-js');
const app = express();

const supaUrl = 'https://iyjjvwlwbfiejvppldia.supabase.co';
const supaAnonKey = 'sb_publishable_JD9rQxZXomUYpSjYM0sziw_F1peEaXI';

const supabase = supa.createClient(supaUrl, supaAnonKey); 

function checkError(error, data, res, message) {
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    if (!data || data.length === 0) {
        return res.status(404).json({ error: `${message}` });
    }
}

app.get('/api/eras', async (req, res) => {
    const {data, error} = await supabase
    .from('eras')
    .select();
    res.send(data);
}); 

app.get('/api/galleries', async (req, res) => {
    const {data, error} = await supabase
    .from('galleries')
    .select();
    res.send(data);
}); 

app.get('/api/galleries/:ref', async (req, res) => {
    const {data, error} = await supabase
    .from('galleries')
    .select()
    .eq('galleryId', req.params.ref);
    checkError(error, data, res, 'No galleries found for that ID');
    res.send(data);
}); 

app.get('/api/galleries/country/:substring', async (req, res) => {
    const {data, error} = await supabase
    .from('galleries')
    .select()
    .ilike('galleryCountry', `${req.params.substring}%`);
    checkError(error, data, res, 'No galleries found for that country');
    res.send(data);
}); 

app.get('/api/artists/', async (req, res) => {
    const {data, error} = await supabase
    .from('artists')
    .select();
    res.send(data);
}); 

app.get('/api/artists/:ref', async (req, res) => {
    const {data, error} = await supabase
    .from('artists')
    .select()
    .eq('artistId', req.params.ref);
    checkError(error, data, res, 'No artist found for that ID');
    res.send(data);
}); 

app.get('/api/artists/search/:substring', async (req, res) => {
    const {data, error} = await supabase
    .from('artists')
    .select()
    .ilike('lastName', `${req.params.substring}%`);
    checkError(error, data, res, 'No artists found with that surname');
    res.send(data);
});

app.get('/api/artists/country/:substring', async (req, res) => {
    const {data, error} = await supabase
    .from('artists')
    .select()
    .ilike('nationality', `${req.params.substring}%`);
    checkError(error, data, res, 'No artists found for that country');
    res.send(data);
});

app.get('/api/genres/', async (req, res) => {
    const {data, error} = await supabase
    .from('genres')
    .select(`
        genreID, genreName, description, wikiLink,
        eras (eraId, eraName, eraYears)`
    );
    res.send(data);
}); 

app.get('/api/genres/:ref', async (req, res) => {
    const {data, error} = await supabase
    .from('genres')
    .select(`
        genreID, genreName, description, wikiLink,
        eras (eraId, eraName, eraYears)`
    )
    .eq('genreID', req.params.ref);
    checkError(error, data, res, 'No genres found with that ID');
    res.send(data);
}); 

app.get('/api/genres/painting/:ref', async (req, res) => {
    const {data, error} = await supabase
    .from('genres')
    .select(`
        genreID, genreName, description, wikiLink,
        eras (eraId, eraName, eraYears),
        paintinggenres!inner (paintingId)
        `)
    .eq('paintinggenres.paintingId', req.params.ref)
    .order('genreName', { ascending: true });
    checkError(error, data, res, 'No genres found for that painting ID');
    res.json(data);
});


app.listen(8080, () => {
 console.log('listening on port 8080');
 console.log('http://localhost:8080/api/genres');
 console.log('http://localhost:8080/api/genres/30');
 console.log('http://localhost:8080/api/genres/painting/408');
}); 