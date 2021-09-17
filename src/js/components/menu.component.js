import Component from './component'

export default class MenuComponent extends Component {
	constructor(idSelector, components) {
		super(idSelector)

		this.components = components
	}

	init() {

		this.menuBtn = document.querySelector('.header-btn')
		this.btnAdd = document.querySelector('.create-btn')

		this.menuBtn.addEventListener('click', e => {
			menuClickHandler.call(this, e)

		})
		this.$el.querySelector('#closeMenu').addEventListener('click', e => {
			menuCloseHandler.call(this, e)
		})

		const dataLinks = document.querySelectorAll('[data-link]')


		dataLinks.forEach(link => {
			link.addEventListener('click', e => {


				const dataLink = link.dataset.link

				if (dataLink) {

					if (link.classList.contains('active')) {
						return
					}

					dataLinks.forEach(link2 => link2.classList.remove('active'))
					link.classList.add('active')

					this.components.forEach(component => component.hide())


					const activeComponent = this.components.find(component => 
						component.$el.getAttribute('id')=== dataLink)

					activeComponent.show()

					this.$el.querySelector('#closeMenu').click()

				}

			})
		})

	}
}


function menuClickHandler(e) {
	this.$el.classList.add('active')
	bodyStyle(calcScroll() + 'px', 'hidden')
	this.btnAdd.style.marginRight = calcScroll() + 'px'

}


function menuCloseHandler(e) {
	this.$el.classList.remove('active')
	bodyStyle('', '')

	this.btnAdd.style.marginRight = ''


}


export function bodyStyle(marginRight, overflow) {
	document.body.style.marginRight = marginRight
	document.body.style.overflow = overflow
}


export function calcScroll() {
	if (screen.availWidth <= 768 || document.documentElement.clientHeight === 
		document.documentElement.scrollHeight) {
		return 0
	}

	let div = document.createElement('div')
	div.style.overflow = 'scroll'
	div.style.visibility = 'hidden'
	div.style.width = div.style.height = '50px'

	document.body.appendChild(div)

	const diff = div.offsetWidth - div.clientWidth

	div.remove()
	
	return diff

}