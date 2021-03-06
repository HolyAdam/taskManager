import './library/index.js'
import './utils/utils.js'
import '../css/style.sass'

import HeaderComponent from './components/header.component'
import MenuComponent from './components/menu.component'
import ProjectsComponent from './components/projects.component'
import AddComponent from './components/add.component'
import LoaderComponent from './components/preloader.component'
import StartComponent from './components/start.component'


const start = new StartComponent('start')
const loader = new LoaderComponent('preloader')
const header = new HeaderComponent('header')

const projects = new ProjectsComponent('project', {loader}) // для логина

const add = new AddComponent('add')

const menu = new MenuComponent('menu', [add, projects])





