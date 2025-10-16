import express from 'express';
import {PORT} from './env.js'
import path from 'path'
const app = express();
import crypto from 'crypto'
import { readFile, writeFile } from 'fs/promises';

const DATA_FILE = path.join(import.meta.dirname, "data", "links.json");
const static_path = path.join(import.meta.dirname, "public");
app.use(express.static(static_path))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//~ Get links file or creating

const loadLinks = async()=>{
    try {
        const data = await readFile(DATA_FILE, "utf-8");
        if(!data.trim()) {
            await writeFile(DATA_FILE, JSON.stringify({}));
            return {};
        }
        return JSON.parse(data);
    } catch (error) {
        if(error.code === "ENOENT") {
            await writeFile(DATA_FILE, JSON.stringify({}));
            return {};
        }
        throw error;
    }
};

const saveLinks = async(links) => {
    await writeFile(DATA_FILE, JSON.stringify(links, null, 2))
}



app.post("/submit", async(req, res)=>{
    const {url, optionalURL} = req.body;
    // console.log("recieved: ", url, optionalURL);

    if(!url) {
        return res.status(400).send("URL is required");
    }

    const shortCode = optionalURL || crypto.randomBytes(4).toString("hex");
    const links = await loadLinks();

    if(links[shortCode]) {
        return res.status(400).sendFile(path.join(import.meta.dirname, "pages", "error.html"))
    }

    links[shortCode] = url;
    await saveLinks(links);

    res.redirect("/")
});

app.get("/links", async(req, res)=>{
        try {
            const links = await loadLinks();
            res.json(links)
        } catch (error) {
            res.status(500).send("Error loading links")
        }
})

app.get("/:shortCode", async(req, res)=>{
    const links = await loadLinks();
    const url = links[req.params.shortCode];
    // console.log("url is", url)
    if(url){
        res.redirect(url)
    }else{
        res.status(400).sendFile(path.join(import.meta.dirname, "pages", error.html))
    }
});

app.delete("/links/:shortCode", async(req, res)=>{
    const shortCode = req.params.shortCode;
    const links = await loadLinks();

    if(links[shortCode]){
        delete links[shortCode];
        await saveLinks(links);
        res.status(200).json({message: "link deleted"});
    }else{
        res.status(404).json({error: "Shortcode not found"})
    }
})

app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})