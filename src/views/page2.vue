<template>
  <div>
    <h1>Page 2</h1>
    <div>
      <p>count： {{count}}</p>
      <button @click="decrementCount">count -1</button>
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

  asyncData({ store, route }) {
  },

  methods: {
    ...mapActions(['decrementCount'])
  }
}
</script>
