import Component from './component'
import apiService from '../services/apiService'
import toArray from '../utils/toArray'

export default class ProjectsComponent extends Component {

	constructor(idSelector, { loader }) {
		super(idSelector)

		this.loader = loader
	}

	static childContainer = document.querySelector('.project-items')

	async init() {

		ProjectsComponent.childContainer.addEventListener('click', clickInputHandler.bind(this))


	}

	async onShow() {

		ProjectsComponent.childContainer.classList.remove('active')
		ProjectsComponent.childContainer.innerHTML = '' // удаляем контент при onShow, дабы при необходимости онли

		document.querySelector('.create').style.display = 'block'

		this.loader.show()

		let data = await apiService.fetchTodos()

		data = toArray.giveMeArray(data)
		console.log(data)

		this.loader.hide()
		ProjectsComponent.childContainer.classList.add('active')

		if (!data || data === 'null') {

			const p = '<p style="text-align: center">Элементов нет</p>'

			ProjectsComponent.childContainer.innerHTML = p

			return false

		}

		data = data.slice(0, 40)

		this.data = data

		const html = this.data.map(render).join('')

		ProjectsComponent.childContainer.innerHTML = html

		activateTooltips()

	}

}

function render({ value, id, completed = false, author }) {

	return `
		<div class="project-item" data-id="${id}">
			<div class="tooltip" role="tooltip">${completed ? 'Выполнено' : 'В процессе'}
			<div class="arrow" data-popper-arrow></div>
			</div>
			<div class="input project-input popcorn" aria-describedby="tooltip">
				<label class="checkbox">
			        <input type="checkbox" ${completed ? 'checked' : ''}>
			        <svg viewBox="0 0 24 24" filter="url(#goo-light)">
			            <path class="tick" d="M4.5 10L10.5 16L24.5 1" />
			            <circle class="dot" cx="10.5" cy="15.5" r="1.5" />
			            <circle class="drop" cx="25" cy="-1" r="2" />
			        </svg>
			    </label>
			</div>
			<span class="project-name ${completed ? 'deleted' : ''}">${value} <a href="#">by ${ author }</a></span>
			<small class="project-users">Users: <small style="color: #36e199">${Math.floor((Math.random() * 100))}</small></small>
		</div>
	`

}


async function clickInputHandler(e) {

	const target = e.target

	const myLink = target.tagName.toLowerCase() === 'span' || target.tagName.toLowerCase() === 'a'

	if (myLink) {

		e.preventDefault()

		const dataId = target.closest('.project-item').dataset.id
		const infoAboutPost = await apiService.fetchTodo(dataId)

		const graphicHTML = renderGraphic(infoAboutPost)
		document.body.insertAdjacentHTML('beforeend', graphicHTML)
		this.hide()


		// обработка бага когда нажимаем два раза подряд очень быстро по случайности
		document.querySelectorAll('#graphicClose').forEach(close => {
			close.addEventListener('click', () => {
				document.querySelectorAll('#graphic').forEach(wind => {
					wind.remove()
				})
				this.show() // обращаемся к серверу
				// this.$el.classList.remove('hide') // можем просто убрать hide без обращения к серву
			})
		})

	}

	if (target.tagName.toLowerCase() === 'input') {
		let id = 0

		this.data = this.data.map((obj) => {
			if (target.closest('.project-item').dataset.id == obj.id) {				
				obj.completed = !obj.completed
				id = obj.id
				if (obj.completed) {
					obj.ended = new Date().toLocaleString()
				} else {
					obj.ended = null
				}
			}

			return obj
		})

		this.loader.show()

		const info = await apiService.updateTask(this.data.find(obj => obj.id === id), id)

		this.loader.hide()

		this.data = this.data.slice(0, 40)

		const html = this.data.map(render).join('')

		ProjectsComponent.childContainer.innerHTML = html

		activateTooltips()

		console.log(this.data)

	}
}



function activateTooltips() {
	const popcorn = document.querySelectorAll('.popcorn')
	const tooltip = document.querySelectorAll('.tooltip')

	const showEvents = ['mouseenter', 'focus'];
	const hideEvents = ['mouseleave', 'blur'];

	showEvents.forEach(event => {
		popcorn.forEach((elem, i) => {
			elem.addEventListener(event, () => {
				if (i === 0) {
					tooltip[i].style.bottom = '-20px'
					tooltip[i].style.top = 'auto'
					tooltip[i].querySelector('.arrow').style.transform = 'rotate(90deg)'
					tooltip[i].querySelector('.arrow').style.top = '-4px'
				}
				tooltip[i].style.display = 'block'
			})
		})
	})

	hideEvents.forEach(event => {
		popcorn.forEach((elem, i) => {
			elem.addEventListener(event, () => {
				tooltip[i].style.display = 'none'
			})
		})
	})
}


function renderGraphic({ completed, value, date, author, ended }) {

	return `

		<div id="graphic">
			<div class="container">
				<button id="graphicClose">
				    &times;
				</button>
				<h2 class="title">График</h2>
				<span class="ended">
					${completed ? 'Завершено' : 'Не закончено'}: <span class="pts">Начало ${date} ${ended ? `- Конец ${ended}` : ''}</span>
				</span>
				<table class="charts-css column show-labels show-data-on-hover show-data-axes show-primary-axis show-5-secondary-axes multiple stacked reverse-datasets" style="height:200px;">
					<caption>House Spending by Countries</caption> 
					<thead>
						<tr>
							<th>Country</th> 
							<th>Rent</th> 
							<th>Food</th> 
							<th>Other</th>
						</tr>
					</thead> 
					<tbody>
						<tr>
							<th style="flex-direction: row" scope="row">${value}</th> 
							<td style="--size:0.2;"><span class="data" style="opacity: 1"> 20% Кирилл </span></td>
							<td style="--size:0.2;"><span class="data" style="opacity: 1"> 20% Андрей </span></td>
							<td style="--size:0.1;"><span class="data" style="opacity: 1"> 10% Антон </span></td>
						</tr> 
					</tbody>
				</table>
				<br>
				<br>
				<p>Автор: <span><strong> ${author}</strong></span></p>
				<p>Задействованы в проекте: <span><strong>Кирилл </strong><strong>Андрей </strong><strong>Антон </strong></span></p>
			</div>
		</div>

	`

}