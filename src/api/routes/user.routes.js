const express = require('express');
const router = express.Router();


router.get("/", (req, res) => res.send("User routes"))
router.patch('/favorite', async (req, res) => {
    //patch favorite course
})
router.post('/create-collection', async (req, res) => {
    //patch favorite course
})

router.patch('/collection', async (req, res) => {
    //patch course in the collection
})

router.put('/tags', async (req, res) => {
    //modify tags array
})

module.exports = router;