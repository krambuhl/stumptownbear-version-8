<section class="strata">
  <div class="wrapper extend-base">
    {{ contents|safe }}
    
    <br/>

    {% for image in images %}
    <div><img src="{{relativity}}{{image}}" width="100%" /></div>
    {% endfor %}
  </div>
</section>