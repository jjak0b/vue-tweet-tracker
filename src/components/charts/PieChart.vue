<script>
import { Pie } from 'vue-chartjs'

export default {
  name: "BarChart",
  extends: Pie,

  props: {
    chartData: Object
  },

  data() {

    return {
      options: {
        legend: {
          display: true
        },
        responsive: true,
        maintainAspectRatio: false
      }
    }
  },

  mounted() {
    this.renderChart(this.chartData, this.options)
  },

  watch: {
    chartData: function (newVal){
      this.chartData = newVal;
      this.renderChart(this.chartData, this.options)
    }
  }

}
</script>