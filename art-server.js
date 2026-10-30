const express = require('express');
const supa = require('@supabase/supabase-js');
const app = express();

const supaUrl = 'https://iyjjvwlwbfiejvppldia.supabase.co';
const supaAnonKey = 'sb_publishable_JD9rQxZXomUYpSjYM0sziw_F1peEaXI';

const supabase = supa.createClient(supaUrl, supaAnonKey); 
const PAINTINGS = '*, artists(*), galleries(*)';

function checkError(error, data, res, message) {
    if (error) {
        res.status(500).json({ error: error.message });
        return true;
    }
    if (!data || data.length === 0) {
        res.status(404).json({ error: `${message}` });
        return true;
    }
    return false;
}

['ref', 'ref2', 'start', 'end'].forEach(name => {
    app.param(name, (req, res, next, value) => {
        if (!/^\d+$/.test(value)) {
            return res.status(404).json({ error: `No results found: "${value}" is not a valid number` });
        }
        next();
    });
});

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
    if (checkError(error, data, res, 'No galleries found for that ID')) return;
    res.send(data);
}); 

app.get('/api/galleries/country/:substring', async (req, res) => {
    const {data, error} = await supabase
    .from('galleries')
    .select()
    .ilike('galleryCountry', `${req.params.substring}%`);
    if (checkError(error, data, res, 'No galleries found for that country')) return;
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
    if (checkError(error, data, res, 'No artist found for that ID')) return;
    res.send(data);
}); 

app.get('/api/artists/search/:substring', async (req, res) => {
    const {data, error} = await supabase
    .from('artists')
    .select()
    .ilike('lastName', `${req.params.substring}%`);
    if (checkError(error, data, res, 'No artists found with that surname')) return;
    res.send(data);
});

app.get('/api/artists/country/:substring', async (req, res) => {
    const {data, error} = await supabase
    .from('artists')
    .select()
    .ilike('nationality', `${req.params.substring}%`);
    if (checkError(error, data, res, 'No artists found for that country')) return;
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
    if (checkError(error, data, res, 'No genres found with that ID')) return;
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
    if (checkError(error, data, res, 'No genres found for that painting ID')) return;
    res.json(data);
});

app.get('/api/paintings/single/:ref', async (req, res) => {
    const {data, error} = await supabase
    .from('paintings')
    .select(PAINTINGS)
    .eq('paintingID', req.params.ref);
    if (checkError(error, data, res, 'No painting found for that ID')) return;
    res.send(data);
});

app.get('/api/paintings/sort/:sortBy/limit/:ref', async (req, res) => {
    const sortByLower = req.params.sortBy.toLowerCase();
    const column = sortByLower === 'year' ? 'yearOfWork' : sortByLower === 'title' ? 'title' : null;
    if (!column) {
        return res.status(400).json({ error: 'Use "year" or "title" to sort.' });
    }

    let query = supabase
    .from('paintings')
    .select(PAINTINGS)
    .order(column, { ascending: true });

    const limit = Number(req.params.ref);
    if (limit > 0) {
        query = query.limit(limit);
    }

    const {data, error} = await query
    if (checkError(error, data, res, 'No paintings found')) return;
    res.send(data);
});


app.get('/api/paintings/sort/:sortBy/limit/:ref/skip/:ref2', async (req, res) => {
    const sortByLower = req.params.sortBy.toLowerCase();
    const column = sortByLower === 'year' ? 'yearOfWork' : sortByLower === 'title' ? 'title' : null;
    if (!column) {
        return res.status(400).json({ error: 'Use "year" or "title" to sort.' });
    }

    const limit = Number(req.params.ref);
    const skip = Number(req.params.ref2);
    const last = limit === 0 ? skip + 9999 : skip + limit - 1;
    const { data, error } = await supabase
        .from('paintings')
        .select(PAINTINGS)
        .order(column, { ascending: true })
        .range(skip, last);

    if (error?.code === 'PGRST103' || (!error && data.length === 0)) {
        return res.status(404).json({ error: 'No paintings found. Skip value is too high.' });
    }

    if (checkError(error, data, res, 'No paintings found')) return;
    res.send(data);
});

app.get('/api/paintings/search/:substring', async (req, res) => {
    const {data, error} = await supabase
    .from('paintings')
    .select(PAINTINGS)
    .ilike('title', `%${req.params.substring}%`)
    .order('yearOfWork', { ascending: true });
    if (checkError(error, data, res, 'No paintings found')) return;
    res.send(data);
});

app.get('/api/paintings/years/:start/:end', async (req, res) => {
    const start = Number(req.params.start)
    const end = Number(req.params.end);
    if (end < start) {
        return res.status(400).json({ error: 'End year cannot be earlier than start year.' });
    }   

    const {data, error} = await supabase
    .from('paintings')
    .select(PAINTINGS)
    .gte('yearOfWork', req.params.start)
    .lte('yearOfWork', req.params.end)
    .order('yearOfWork', { ascending: true });

    if (checkError(error, data, res, 'No paintings found in those years')) return;
    res.send(data);
});

app.get('/api/paintings/galleries/:ref', async (req, res) => {
    const {data, error} = await supabase
    .from('paintings')
    .select(PAINTINGS)
    .eq('galleryID', req.params.ref)
    .order('yearOfWork', { ascending: true });
    if (checkError(error, data, res, 'No paintings found for that gallery')) return;
    res.send(data);
});

app.get('/api/paintings/artist/:ref', async (req, res) => {
    const {data, error} = await supabase
    .from('paintings')
    .select(PAINTINGS)
    .eq('artistID', req.params.ref)
    .order('yearOfWork', { ascending: true });
    if (checkError(error, data, res, 'No paintings found for that artist')) return;
    res.send(data);
});

app.get('/api/paintings/genre/:ref', async (req, res) => {
    const {data, error} = await supabase
    .from('paintings')
    .select(`
        paintingID, title, yearOfWork, paintinggenres!inner (genreId)
    `)
    .eq('paintinggenres.genreId', req.params.ref)
    .order('yearOfWork', { ascending: true });
    if (checkError(error, data, res, 'No paintings found for that genre')) return;
    res.send(data);
});

app.get('/api/paintings/era/:ref', async (req, res) => {
    const {data, error} = await supabase
    .from('paintings')
    .select(`
        paintingID, title, yearOfWork, paintinggenres!inner (genres!inner (eraID))
    `)
    .eq('paintinggenres.genres.eraID', req.params.ref)
    .order('yearOfWork', { ascending: true });
    if (checkError(error, data, res, 'No paintings found for that era')) return;
    res.send(data);
});


async function genreCounts() {
    const {data, error} = await supabase
    .from('genres')
    .select('genreName, paintinggenres (count)');
    const counts = data?.map(g => ({ genreName: g.genreName, count: g.paintinggenres[0].count }));
    return { counts, error };
}

app.get('/api/counts/genres', async (req, res) => {
    const { counts, error } = await genreCounts();
    if (checkError(error, counts, res, 'No genres found')) return;
    res.send(counts.sort((a, b) => a.count - b.count));
});

app.get('/api/counts/topgenres/:ref', async (req, res) => {
    const { counts, error } = await genreCounts();
    if (error) return checkError(error, counts, res, '');
    const top = counts.filter(g => g.count > Number(req.params.ref)).sort((a, b) => b.count - a.count);
    if (checkError(null, top, res, 'No genres found with that many paintings')) return;
    res.send(top);
});

app.get('/api/counts/artists', async (req, res) => {
    const {data, error} = await supabase
    .from('artists')
    .select('firstName, lastName, paintings (count)');
    if (checkError(error, data, res, 'No artists found')) return;
    const counts = data
        .map(a => ({ artistName: `${a.firstName} ${a.lastName}`, count: a.paintings[0].count }))
        .sort((a, b) => b.count - a.count);                    // most -> fewest
    res.send(counts);
});

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.listen(8080, () => {
    const base = `http://localhost:8080`;
    console.log('listening on port 8080');

    console.log(`${base}/api/paintings/sort/year/limit`);
    console.log(`${base}/api/paintings/sort/year/limit/10/skip`);
    console.log(`${base}/api/paintings/era/2`);
}); 