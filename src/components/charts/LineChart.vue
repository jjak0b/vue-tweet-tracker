<script>
import { Line } from 'vue-chartjs'

export default {
  name: "LineChart",
  extends: Line,

  props: {
    selectedState: String,
    chartData: Object,
  },

  data () {
    return {

      /*chartData: {
        labels: Object.keys(this.tweetsCountry[this.selectedState]),
        datasets: this.regions [
          {
            label: 'Line Chart',
            data: [600,	1150,	342,	6050,	2522,	3241,	1259,	157,	1545, 9841],
            fill: false,
            borderColor: '#2554FF',
            backgroundColor: '#2554FF',
            borderWidth: 1
          }
        ]
      }, */

      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            },
            gridLines: {
              display: true
            }
          }],
          xAxes: [ {
            gridLines: {
              display: false
            }
          }]
        },
        legend: {
          display: true
        },
        responsive: true,
        maintainAspectRatio: false
      }
    }
  },

  mounted () {
      this.renderChart(this.chartData, this.options)
  },

  watch:{ //Da aggiungere controllo anche cambiamento tweets
    selectedState: function (newVal){
      this.selectedState = newVal;
      this.renderChart(this.chartData, this.options)
    },

    chartData: function (newVal){
      this.chartData = newVal;
      this.renderChart(this.chartData, this.options)
    }
  },


}
</script>
