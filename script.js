const openModal = document.getElementById('open-modal-btn')
const modalEl = document.getElementById('modal')
const totalHabit = document.getElementById('total-habits')
const todayProgress = document.getElementById('today-progress')
const pendingHabitEl = document.getElementById('pending-habits')
const completedHabitEl = document.getElementById('completed-habits')
const currentStreakEl = document.getElementById('current-streak')
const bestStreakEl = document.getElementById('best-streak')
const habitNameEl = document.getElementById('habit-name')
const habitCategory = document.getElementById('habit-category')
const habitForm = document.getElementById('habit-form')
const habitNameError = document.getElementById('habitName-error')
const habitCategoryError = document.getElementById('habitCategory-error')
const habitGoalError = document.getElementById('habitGoal-error')
const closeModalBtn = document.getElementById('close-modal-btn')
const categoryFrequency = document.getElementById('frequency')
const weeklyFrequency = document.getElementById('weekly-frequency')
const emptyStateEl = document.querySelector('.empty-state')
const dailyFreqEl = document.getElementById('daily')
const weeklyFreqEl = document.getElementById('weekly')
const habitGoal = document.querySelectorAll('input[name="goal-type"]')
const habitCardEl = document.getElementById('habit-card')

let categories = [
    {
        name: "Health",
        color: "#22c55e",
        icon: `<i class="fas fa-heart"></i>`
    },
    {
        name: "Fitness",
        color: "#ef4444",
        icon: `<i class="fas fa-dumbbell"></i>`
    },
    {
        name: "Productivity",
        color: "#3b82f6",
        icon: `<i class="fas fa-industry"></i>`
    },
    {
        name: "Learning",
        color: "#a855f7",
        icon: `<i class="fas fa-book-open"></i>`
    },
    {
        name: "Social",
        color: "#f97316",
        icon: `<i class="fab fa-x-twitter"></i>`
    },
    {
        name: "Finance",
        color: "#eab308",
        icon: `<i class="fas fa-piggy-bank"></i> `
    }
    
]

let editId = null

let habits = []
try{
    habits = JSON.parse(localStorage.getItem('habits')) || []
}catch{
    habits = []
}

function updateLocalstorage(){
    localStorage.setItem('habits', JSON.stringify(habits))
}

categories.forEach(function(category){
    let option = document.createElement('option')
    option.value = category.name
    option.textContent = category.name
    habitCategory.appendChild(option)
})

openModal.addEventListener('click', function(){
    modalEl.classList.remove('hidden')
})

closeModalBtn.addEventListener('click', function(){
    modalEl.classList.add('hidden')
})

habitGoal.forEach(function(radio){
    radio.addEventListener('change', function(){
        if(this.value === 'daily'){
            weeklyFrequency.style.display = 'none'
        }else if(this.value === 'weekly'){
            weeklyFrequency.style.display = 'block'
            categoryFrequency.value = 3
        }
    })
})

function createHabit(e){
    e.preventDefault()
    let habitNameValue = habitNameEl.value.trim()
    let selectedCategoryValue = habitCategory.value
    let frequencyValue = categoryFrequency.value
    let selectedGoal = document.querySelector('input[name="goal-type"]:checked')
    let selectedGoalValue = null
    if(selectedGoal){
        selectedGoalValue = selectedGoal.value
    }

    if(selectedGoal && selectedGoal.value === 'daily'){
        selectedGoalValue = {
            type: "daily",
            frequency: 1
        }
    }else if(selectedGoal && selectedGoal.value === 'weekly'){
        selectedGoalValue = {
            type: "weekly",
            frequency: Number(frequencyValue)
        }
    }

    let isValid = true
    if(!habitNameValue){
        habitNameError.style.display = 'block'
        isValid = false
    }else{
        habitNameError.style.display = 'none'
    }

    if(!selectedCategoryValue){
        habitCategoryError.style.display = 'block'
        isValid = false
    }else{
        habitCategoryError.style.display = 'none'
    }

    if(selectedGoalValue && selectedGoalValue.type === 'weekly'){
        if(!frequencyValue){
            habitGoalError.style.display = 'block'
            isValid = false
        }else{
            habitGoalError.style.display = 'none'
        }
    }

    if(!selectedGoal){
        habitGoalError.style.display = 'block'
        isValid = false
    }else{
        habitGoalError.style.display = 'none'
    }

    if(!isValid)return

    if(editId !== null){
        const habit = habits.find(function(habit){
            return habit.uniqueId === editId
        })

        if(habit){
            habit.habitName = habitNameValue
            habit.category = selectedCategoryValue
            
            const oldGoalType = habit.goal.type
            habit.goal = selectedGoalValue

            if(oldGoalType !== selectedGoalValue.type){
                habit.currentStreak = 0
                habit.bestStreak = 0
            } else {
                if(selectedGoalValue.type === 'daily'){
                    habit.currentStreak = calculateDailyStreak(habit)
                } else {
                    habit.currentStreak = calculateWeeklyStreak(habit)
                }
            }
        }
        
        editId = null
        updateLocalstorage()
        displayHabit()

        habitNameEl.value = ""
        habitCategory.value = ""
        document.getElementById('daily').checked = true
        weeklyFrequency.style.display = 'none'
        categoryFrequency.value = 3
        modalEl.classList.add('hidden')
    }else {
        let habitObj = {
            uniqueId: Date.now(),
            habitName: habitNameValue,
            category: selectedCategoryValue,
            goal: selectedGoalValue,
            completed:false,
            completions: [],
            currentStreak: 0,
            bestStreak: 0,
            createdDate: new Date().toDateString()
        }

        habits.push(habitObj)
    }
    updateLocalstorage()
    displayHabit()
    document.querySelector('#submit-btn').textContent = "Add Habit"

    habitNameEl.value = ""
    habitCategory.value = ""
    document.getElementById('daily').checked = true
    weeklyFrequency.style.display = 'none'
    categoryFrequency.value = 3
    modalEl.classList.add('hidden')
}

function displayHabit(){
    pendingHabitEl.innerHTML = ''
    completedHabitEl.innerHTML = ''

    const pending = habits.filter(function(habit){
        return !habit.completed
    })

    const completed = habits.filter(function(habit){
        return habit.completed
    })

    if(pending.length === 0){
        pendingHabitEl.innerHTML = `<p class="empty-state">No pending habits.</p>`
    }else{
        pending.forEach(function(habit){
            const categoryObj = categories.find(function(cate){
                return cate.name === habit.category
            })
            let habitCard = document.createElement('div')
            habitCard.classList.add('habit-card')
            habitCard.dataset.id = habit.uniqueId
            const progress = calculateProgress(habit)

            habitCard.innerHTML = `
                <div class="habit-top">
                    <h3 class="habit-name">${habit.habitName}</h3>
                    <input type="checkbox" class="complete-checkbox" ${habit.completed ? 'checked' : '' }>
                </div>

                <p class="habit-category" style="background:${categoryObj.color}">${categoryObj.icon} ${habit.category}</p>
                <p class="habit-goal">${habit.goal.type === 'daily' ? 'Daily' : `${habit.goal.frequency}x per week`}</p>

                <div class="habit-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%; background:${categoryObj.color}"></div>
                    </div>
                    <span class="progress-text">${Math.round(progress)}%</span>
                </div>

                <p class="streak"><i class="fas fa-fire"></i><span class="streak-count">${habit.currentStreak}</span> day streak</p>

                <div class="habit-actions">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `

            pendingHabitEl.appendChild(habitCard)
        })
    }

    if(completed.length === 0){
        completedHabitEl.innerHTML = `<p class="empty-state">No completed habits yet.</p>`
    }else{
        completed.forEach(function(habit){
            const categoryObj = categories.find(function(cate){
                return cate.name === habit.category
            })

            let habitCard = document.createElement('div')
            habitCard.className = 'habit-card completed'
            habitCard.dataset.id = habit.uniqueId
            const progress = calculateProgress(habit)

            habitCard.innerHTML = `
                <div class="habit-top">
                    <h3 class="habit-name">${habit.habitName}</h3>
                    <input type="checkbox" class="complete-checkbox" ${habit.completed ? 'checked' : ''}>
                </div>

                <p class="habit-category" style="background:${categoryObj.color}">${categoryObj.icon} ${habit.category}</p>
                <p class="habit-goal">${habit.goal.type === 'daily' ? 'Daily' : `${habit.goal.frequency}x per week`}</p>

                <div class="habit-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%; background:${categoryObj.color}"></div>
                    </div>
                    <span class="progress-text">${Math.round(progress)}%</span>
                </div>

                <p class="streak"><i class="fas fa-fire"></i><span class="streak-count">${habit.currentStreak}</span> day streak</p>

                <div class="habit-actions">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `
            completedHabitEl.appendChild(habitCard)
        })
    }
    updateStats()
    updateStreakStats()
}

function getStartOfWeek(date){
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(date.setDate(diff))
}

function getWeekEnd(date){
    const start = getStartOfWeek(date)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return end
}

function weeklyCompletions(habit){
    const today = new Date()
    const {start,end} = getWeekRange(today)
    return habit.completions.filter(function(dateStr){
        const date = new Date(dateStr)
        return date >= start && date <= end
    }).length
}

function getWeekRange(date){
    return{
        start: getStartOfWeek(date),
        end: getWeekEnd(date)
    }
}

function handleAction(e){
    const clickedCard = e.target.closest('.habit-card')
    if(!clickedCard)return

    const clickedCardId = Number(clickedCard.dataset.id)

    if(e.target.closest('.edit-btn')){
        editHabit(clickedCardId)
        return
    }

    if(e.target.closest('.delete-btn')){
        deleteHabit(clickedCardId)
        return
    }
}

function editHabit(cardId){
    const findEdit = habits.find(function(habit){
        return habit.uniqueId === cardId
    })

    if(findEdit){
        editId = cardId
        modalEl.classList.remove('hidden')

        document.querySelector('#submit-btn').textContent = "Update Habit"

        habitNameEl.value = findEdit.habitName
        habitCategory.value = findEdit.category

        if(findEdit.goal.type === 'daily'){
            dailyFreqEl.checked = true
            weeklyFrequency.style.display = 'none'
        } else{
            weeklyFreqEl.checked = true
            weeklyFrequency.style.display = 'block'
            categoryFrequency.value = findEdit.goal.frequency
        }
    }
}

function deleteHabit(cardId){
    const findDelete = habits.findIndex(function(habit){
        return habit.uniqueId === cardId
    })

    if(findDelete !== -1){
        habits.splice(findDelete, 1)
    }

    updateLocalstorage()
    displayHabit()
}

function handleToggle(e){
    if(!e.target.classList.contains('complete-checkbox'))return

    const habitCard = e.target.closest('.habit-card')
    const habitCardId = Number(habitCard.dataset.id)

    const habit = habits.find(function(habit){
        return habit.uniqueId === habitCardId
    })

    if(!habit)return

    const today = new Date().toDateString()

    if(habit.completions.includes(today)){
        habit.completions = habit.completions.filter(function(date){
            return date !== today
        })
        habit.completed = false

        if(habit.goal.type === 'daily'){
            habit.currentStreak = calculateDailyStreak(habit)
        }
    } else {
        habit.completions.push(today)

        if(habit.goal.type === 'daily'){
            habit.completed = true

            habit.currentStreak = calculateDailyStreak(habit)
            if(habit.currentStreak > habit.bestStreak){
                habit.bestStreak = habit.currentStreak
            }
        } else if(habit.goal.type === 'weekly'){
            habit.completed = weeklyCompletions(habit) >= habit.goal.frequency

            habit.currentStreak = calculateWeeklyStreak(habit)
            if(habit.currentStreak > habit.bestStreak){
                habit.bestStreak = habit.currentStreak
            }
        }
    }

    updateLocalstorage()
    displayHabit()
}

function calculateDailyStreak(habit){
    const today = new Date().toDateString()

    if(!habit.completions.includes(today)){
        return 0
    }

    let streak = 1

    let checkDate = new Date()
    checkDate.setDate(checkDate.getDate() - 1)

    while(true){
        const dateStr = checkDate.toDateString()

        if(habit.completions.includes(dateStr)){
            streak++
            checkDate.setDate(checkDate.getDate() - 1)
        } else {
            break
        }
    }
    return streak
}

function countCompletionsInWeek(completions, weekStart, weekEnd){
    return completions.filter(function(dateStr){
        const date = new Date(dateStr)
        return date >= weekStart && date <= weekEnd
    }).length
}

function calculateWeeklyStreak(habit){
    const today = new Date()
    const currentWeek = getWeekRange(today)

    const currentCount = countCompletionsInWeek(
        habit.completions,
        currentWeek.start,
        currentWeek.end
    )

    if(currentCount < habit.goal.frequency){
        return 0
    }

    let streak = 1

    let checkDate = new Date(currentWeek.start)
    checkDate.setDate(checkDate.getDate() - 1)

    while(true){
        const week = getWeekRange(checkDate)
        const count = countCompletionsInWeek(
            habit.completions,
            week.start,
            week.end
        )

        if(count >= habit.goal.frequency){
            streak++
            checkDate.setDate(checkDate.getDate() - 7)
        }else {
            break
        }
    }
    return streak
}

function calculateProgress(habit){
    if(habit.goal.type === 'daily'){
        const today = new Date().toDateString()
        return habit.completions.includes(today) ? 100 : 0
    }

    if(habit.goal.type === 'weekly'){
        const total = weeklyCompletions(habit)
        const required = habit.goal.frequency

        const percentage = (total / required) * 100
        return Math.min(percentage, 100)
    }
}

function updateStats(){
    totalHabit.textContent = habits.length

    const completedToday = habits.filter(function(habit){
        const today = new Date().toDateString()
        return habit.completions.includes(today)
    }).length

    todayProgress.textContent = completedToday
}

function updateStreakStats(){
    if(habits.length === 0){
        currentStreakEl.textContent = 0
        bestStreakEl.textContent = 0
        return
    }

    let maxCurrent = 0
    let maxBest = 0

    habits.forEach(function(habit){
        if(habit.currentStreak > maxCurrent){
            maxCurrent = habit.currentStreak
        }

        if(habit.bestStreak > maxBest){
            maxBest = habit.bestStreak
        }
    })

    currentStreakEl.textContent = maxCurrent
    bestStreakEl.textContent = maxBest
}

pendingHabitEl.addEventListener('click', handleAction)
completedHabitEl.addEventListener('click', handleAction)

pendingHabitEl.addEventListener('change', handleToggle)
completedHabitEl.addEventListener('change', handleToggle)
habitForm.addEventListener('submit', createHabit)
displayHabit()
// updateStats()
