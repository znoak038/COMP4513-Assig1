const express = require('express');
const supa = require('@supabase/supabase-js');
const app = express();

const supaUrl = 'https://iyjjvwlwbfiejvppldia.supabase.co';
const supaAnonKey = 'sb_publishable_JD9rQxZXomUYpSjYM0sziw_F1peEaXI';

const supabase = supa.createClient(supaUrl, supaAnonKey); 

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
    res.send(data);
}); 

app.get('/api/galleries/country/:substring', async (req, res) => {
    const {data, error} = await supabase
    .from('galleries')
    .select()
    .ilike('galleryCountry', `${req.params.substring}%`);
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
    res.send(data);
}); 

app.get('/api/artists/search/:substring', async (req, res) => {
    const {data, error} = await supabase
    .from('artists')
    .select()
    .ilike('lastName', `${req.params.substring}%`);
    res.send(data);
});

app.get('/api/artists/country/:substring', async (req, res) => {
    const {data, error} = await supabase
    .from('artists')
    .select()
    .ilike('nationality', `${req.params.substring}%`);
    res.send(data);
});

app.listen(8080, () => {
 console.log('listening on port 8080');
 console.log('http://localhost:8080/api/artists');
 console.log('http://localhost:8080/api/artists/30');
 console.log('http://localhost:8080/api/artists/search/go');
 console.log('http://localhost:8080/api/artists/country/fra');
}); 