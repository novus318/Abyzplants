import express from "express"
import colors from "colors"
import dotenv from 'dotenv'
import morgan from "morgan"
import connectDB from "./config/db.js"
import authRoutes from './routes/authRoute.js'
import categoryRoutes from './routes/categoryRoute.js'
import productRoutes from './routes/productRoute.js'
import potRoutes from './routes/potRoute.js'
import orderRoutes from './routes/orderRoute.js'
import cors from 'cors'
import path from "path"
//configure env
dotenv.config({ path: './.env' })

//database configcon
connectDB();

//rest object
const app = express()

//middlewares
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
  }));
app.use(express.json())
app.use(morgan('dev'))

//routes
app.use('/api/logo', express.static(path.join(new URL(import.meta.url).pathname, '..', 'logo')));
app.use('/api/images', express.static(path.join(new URL(import.meta.url).pathname, '..', 'images')));
app.use('/api/Potimages', express.static(path.join(new URL(import.meta.url).pathname, '..', 'Potimages')));
app.use('/api/Bannerimages', express.static(path.join(new URL(import.meta.url).pathname, '..', 'Bannerimages')));
app.use('/api/auth',authRoutes)
app.use('/api/category',categoryRoutes)
app.use('/api/product',productRoutes)
app.use('/api/pot',potRoutes)
app.use('/api/order',orderRoutes)
//rest api
app.get('/api',(req,res)=>{
    res.send({
        message:'welcome to app'
    })
})

//port
const PORT=process.env.PORT || 8080;

//run listen
app.listen(PORT,()=>{
    console.log(`server running on ${process.env.DEV_MODE} port ${PORT}`.bgGreen.white)
})