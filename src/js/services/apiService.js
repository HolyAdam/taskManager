class ApiService {

	constructor(apiUrl) {
		this.url = apiUrl
	}

	async fetchTodos(num = '') {

		try {
			const request = new Request(`${this.url}/tasks.json${num}`)
			const response = await fetch(request)

			const data = await response.json()

			return data
		} catch(e) {
			console.log(e)
		}

	}


	async fetchTodo(id) {

		try {
			const request = new Request(`${this.url}/tasks/${id}.json`)
			const response = await fetch(request)

			const data = await response.json()

			return data
		} catch(e) {
			console.log(e)
		}

	}


	async getTasks() {

		try {
			const request = new Request(`https://jsonplaceholder.typicode.com/posts`)
			const response = await fetch(request)

			const data = await response.json()

			return data
		} catch(e) {
			console.log(e)
		}

	}

	async postTask(task) {

		try {
			const request = new Request(`${this.url}/tasks.json`, {
				method: 'POST',
				body: JSON.stringify(task),
				headers: {
					'Content-Type': 'application/json'
				}
			})
			const response = await fetch(request)

			const data = await response.json()

			return data
		} catch(e) {
			console.log(e)
		}

	}


	async updateTask(task, id) {

		try {
			const request = new Request(`${this.url}/tasks/${id}.json`, {
				method: 'PUT',
				body: JSON.stringify(task),
				headers: {
					'Content-Type': 'application/json'
				}
			})
			const response = await fetch(request)

			const data = await response.json()

			return data
		} catch(e) {
			console.log(e)
		}

	}

}

const apiService = new ApiService('https://taskmanager412-default-rtdb.firebaseio.com')

export default apiService

