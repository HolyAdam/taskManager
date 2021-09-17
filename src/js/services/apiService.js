class ApiService {

	constructor(apiUrl) {
		this.url = apiUrl
	}

	async fetchTodos(num = '') {

		try {
			const request = new Request(`${this.url}/todos${num}`)
			const response = await fetch(request)

			const data = await response.json()

			return data
		} catch(e) {
			console.log(e)
		}

	}

}

const apiService = new ApiService('https://jsonplaceholder.typicode.com')

export default apiService

