<template>
  <div>
    <h1>Page 111111111111222222222222</h1>
    <div>
      <p>count： {{count}}</p>
      <button @click="incrementCount">count +1</button>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState({
      count: state => state.count
    })
  },

  methods: {
    ...mapActions(['incrementCount'])
  }
}
</script>
