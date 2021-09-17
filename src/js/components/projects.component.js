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

		ProjectsComponent.childContainer.innerHTML = '' // удаляем контент при onShow, дабы при необходимости онли

		document.querySelector('.create').style.display = 'block'

		this.loader.show()

		let data = await apiService.fetchTodos()

		data = toArray.giveMeArray(data)
		console.log(data)

		this.loader.hide()

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

function render({ userId, value, id, completed = false }) {

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
			<span class="project-name ${completed ? 'deleted' : ''}">${value} <a href="#">by Achek Slime</a></span>
			<small class="project-users">Users: <span>${id}</span></small>
		</div>
	`

}


function clickInputHandler(e) {

	const target = e.target

	const myLink = target.tagName.toLowerCase() === 'span' || target.tagName.toLowerCase() === 'a'

	if (myLink) {
		const graphicHTML = renderGraphic()
		document.body.insertAdjacentHTML('beforeend', graphicHTML)
		this.hide()

		document.getElementById('graphicClose').addEventListener('click', () => {
			document.getElementById('graphic').remove()
			this.show()
		})

	}

	if (target.tagName.toLowerCase() === 'input') {

		this.data = this.data.map(obj => {
			if (target.closest('.project-item').dataset.id == obj.id) {
				obj.completed = !obj.completed
			}

			return obj
		})

		const newHtml = this.data.map(render).join('')
		ProjectsComponent.childContainer.innerHTML = newHtml

		activateTooltips()

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


function renderGraphic(obj) {

	return `

		<div id="graphic">
			<div class="container">
				<button id="graphicClose">
				    &times;
				</button>
				<h2 class="title">График</h2>
				<span class="ended">
					Не завершено || Завершено за 12 часов
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
							<th style="flex-direction: row" scope="row">Сделать превью. Начало: <span style="display: inline-block; margin-left: 5px; color: #36e199"> 01.09.2021</span></th> 
							<td style="--size:0.2;"><span class="data" style="opacity: 1"> 20% Кирилл </span></td>
							<td style="--size:0.2;"><span class="data" style="opacity: 1"> 20% Андрей </span></td>
							<td style="--size:0.1;"><span class="data" style="opacity: 1"> 10% Антон </span></td>
						</tr> 
						<tr>
							<th style="flex-direction: row" scope="row">Сделать таск 2. Начало: <span style="display: inline-block; margin-left: 5px; color: #36e199"> 01.09.2021</span></th> 
							<td style="--size:0.2;"><span class="data"> 20% Кирилл </span></td>
							<td style="--size:0.4;"><span class="data"> 40% Андрей </span></td>
							<td style="--size:0.4;"><span class="data"> 40% Антон </span></td>
						</tr>
					</tbody>
				</table>
				<br>
				<br>
				<p>Задействованы в проекте: <span><strong>Кирилл </strong><strong>Андрей </strong><strong>Антон </strong></span></p>
			</div>
		</div>

	`

}