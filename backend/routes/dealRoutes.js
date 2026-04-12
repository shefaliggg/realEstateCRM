const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { getDeals, getDealById, createDeal, updateDeal, deleteDeal } = require('../controllers/dealController')

router.route('/').get(protect, getDeals).post(protect, createDeal)
router.route('/:id').get(protect, getDealById).put(protect, updateDeal).delete(protect, deleteDeal)

module.exports = router
