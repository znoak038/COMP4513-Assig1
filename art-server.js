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

app.get('/api/paintings/single/:ref', async (req, res) => {
    const {data, error} = await supabase
    .from('paintings')
    .select()
    .eq('paintingID', req.params.ref);
    checkError(error, data, res, 'No painting found for that ID');
    res.send(data);
});

app.get('/api/paintings/sort/:sortBy/limit/:ref', async (req, res) => {
    const limit = parseInt(req.params.ref, 10);
    let query = supabase
    .from('paintings')
    .select();

    if (req.params.sortBy === 'year') {
        query = query.order('yearOfWork', { ascending: true });
    } else if (req.params.sortBy === 'title') {
        query = query.order('title', { ascending: true });
    } else {
        return res.status(400).json({ error: 'Use "year" or "title" to sort.' });
    }

    if (limit === 0) {
        query = query.limit(limit);
    } else if (limit < 0) {
        return res.status(400).json({ error: 'Limit can\'t be negative.' });
    }

    const {data, error} = await query
    checkError(error, data, res, 'No paintings found');
    res.send(data);
});

app.get('/api/paintings/sort/:sortBy/limit/:ref/skip/:ref2', async (req, res) => {
    const limit = req.params.ref;
    const skip = req.params.ref2;
    let query = supabase
    .from('paintings')
    .select()
    .range(skip, skip + limit - 1);

    if (req.params.sortBy === 'year') {
        query = query.order('yearOfWork', { ascending: true });
    } else if (req.params.sortBy === 'title') {
        query = query.order('title', { ascending: true });
    } else {
        return res.status(400).json({ error: 'Use "year" or "title" to sort.' });
    }

    if (limit === 0) {
        query = query.limit(limit);
    } else if (limit < 0) {
        return res.status(400).json({ error: 'Limit can\'t be negative.' });
    }

    const {data, error} = await query
    if (skip >= data.length) {
        return res.status(400).json({ error: 'Skip value is too high.' });
    }
    checkError(error, data, res, 'No paintings found');
    res.send(data);
});

//paintins whos title CONTAINS the provided substring. does not matter if the substring is at the start, middle or end of the title. case insensitive
app.get('/api/paintings/search/:substring', async (req, res) => {
    const {data, error} = await supabase
    .from('paintings')
    .select()
    .ilike('title', `%${req.params.substring}%`)
    .order('yearOfWork', { ascending: true });
    checkError(error, data, res, 'No paintings found');
    res.send(data);
});

app.get('/api/paintings/years/:start/:end', async (req, res) => {
    const {data, error} = await supabase
    .from('paintings')
    .select()
    .gte('yearOfWork', req.params.start)
    .lte('yearOfWork', req.params.end)
    .order('yearOfWork', { ascending: true });
    checkError(error, data, res, 'No paintings found in those years');
    res.send(data);
});

app.get('/api/paintings/galleries/:ref', async (req, res) => {
    const {data, error} = await supabase
    .from('paintings')
    .select()
    .eq('galleryID', req.params.ref)
    .order('yearOfWork', { ascending: true });
    checkError(error, data, res, 'No paintings found for that gallery');
    res.send(data);
});

app.get('/api/paintings/artist/:ref', async (req, res) => {
    const {data, error} = await supabase
    .from('paintings')
    .select()
    .eq('artistID', req.params.ref)
    .order('yearOfWork', { ascending: true });
    checkError(error, data, res, 'No paintings found for that artist');
    res.send(data);
});

// TODO fix to get the genre from foreign keys since paintings doesn't have genreID
app.get('/api/paintings/genre/:ref', async (req, res) => {
    const {data, error} = await supabase
    .from('paintings')
    .select(`
        paintingID, title, yearOfWork
    `)
    .eq('genreId', req.params.ref)
    .order('yearOfWork', { ascending: true });
    checkError(error, data, res, 'No paintings found for that genre');
    res.send(data);
});

// TODO fix to get the era from foreign keys since paintings doesn't have eraID
app.get('/api/paintings/era/:ref', async (req, res) => {
    const {data, error} = await supabase
    .from('paintings')
    .select(`
        paintingID, title, yearOfWork
    `)
    .eq('eraId', req.params.ref)
    .order('yearOfWork', { ascending: true });
    checkError(error, data, res, 'No paintings found for that era');
    res.send(data);
});

// TODO fix to not use aggregate functions
app.get('/api/counts/genres', async(req, res) => {
    const {data, error} = await supabase
    .from('genres')
    .select(`
        genreName, count
    `)
    .eq('count', 'paintings')
    .order('count', { ascending: true });
    checkError(error, data, res, 'No genres found');
    res.send(data);
});

// TODO fix to not use aggregate functions
app.get('/api/counts/artists', async(req, res) => {
    const {data, error} = await supabase
    .from('artists')
    .select(`
        firstName, lastName, count
    `)
    .eq('count', 'paintings')
    .order('count', { ascending: true });
    checkError(error, data, res, 'No artists found');
    res.send(data);
});

// TODO fix to not use aggregate functions
app.get('/api/counts/topgenres/:ref', async(req, res) => {
    const {data, error} = await supabase
    .from('genres')
    .select(`
        genreName, count
    `)
    .gt('count', req.params.ref)
    .order('count', { ascending: false });
    checkError(error, data, res, 'No genres found');
    res.send(data);
});

app.listen(8080, () => {
 console.log('listening on port 8080');
 console.log('http://localhost:8080/api/paintings/genre/78');
 console.log('http://localhost:8080/api/paintings/era/2');
 console.log('http://localhost:8080/api/counts/genres');
 console.log('http://localhost:8080/api/counts/artists');
 console.log('http://localhost:8080/api/counts/topgenres/10');
}); 