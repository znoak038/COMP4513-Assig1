const express = require('express');
const supa = require('@supabase/supabase-js');
const app = express();

const supaUrl = '<SOME_KEY>';
const supaAnonKey = '<SOME_KEY>>';

const supabase = supa.createClient(supaUrl, supaAnonKey); 

app.get('/f1/eras', async (req, res) => {
 const {data, error} = await supabase
 .from('eras')
 .select();
 res.send(data);
}); 


app.listen(8080, () => {
 console.log('listening on port 8080');
 console.log('http://localhost:8080/api/eras');
}); 