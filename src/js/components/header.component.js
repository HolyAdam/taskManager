import Component from './Component'

export default class HeaderComponent extends Component {
	constructor(id) {
		super(id)
	}


	init() {

		this.profile = this.$el.querySelector('.header-profile')
		this.profile.style.cursor = 'pointer'

		this.profile.addEventListener('click', profileClickHandler.bind(this))		

	}

}


function profileClickHandler() {

	// this.$el.querySelector('.profile-menu').classList.toggle('active')

}