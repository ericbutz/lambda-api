//let splunkjs = require('splunk-sdk');
import splunkjs from 'splunk-sdk'

import 'dotenv/config'
//dotenv.config()

interface ServiceParams {
  username: string
  password: string
  scheme: string
  host: string
  port: number
  version: string
}

export class SplunkAgent {
  serviceParams: ServiceParams
  service: any

  constructor(options: any) {
    this.serviceParams = options.serviceParams

  }

  async login() {
    this.service = new splunkjs.Service(this.serviceParams)
    //try {
      const response = await this.service.login();
      //console.log('response: ', response)
      console.log('usrename: ', process.env.SPLUNK_USERNAME)
      return response
    // } catch (err) {
    //   console.log("Error in logging in: ", err);
    //   return err
    // }
  }

  async listAlerts() {
    try {
      // Get the collection of all fired alert groups for the current user
      let firedAlertGroups = await this.service.firedAlertGroups().fetch();
              
      // Get the list of all fired alert groups, including the all group (represented by "-")
      firedAlertGroups = firedAlertGroups.list();
      console.log("Fired alert groups:", firedAlertGroups);
              
      // For each fired alert group...
      for(let a in firedAlertGroups) {
        if (firedAlertGroups.hasOwnProperty(a)) {
          let firedAlertGroup = firedAlertGroups[a];
          let firedAlerts;
          [firedAlerts, firedAlertGroup] = await firedAlertGroup.list();
          // How many times were this group's alerts fired?
          console.log(firedAlertGroup.name, "(Count:", firedAlertGroup.count(), ")");
          // Print the properties for each fired alert (default of 30 per alert group)
          for(let i = 0; i < firedAlerts.length; i++) {
              let firedAlert = firedAlerts[i];
              for(let key in firedAlert.properties()) {
                  if (firedAlert.properties().hasOwnProperty(key)) {
                      console.log("\t", key, ":", firedAlert.properties()[key]);
                  }
              }
              console.log();
          }
          console.log("======================================");
        }
      }

      return "return"
    } catch (err) {
      console.log("Error:", err);
    }
  }

  async createAlert(productName: string, id: string, indicators: {}, alertOptions?: {}) { 
    try {
      const timestamp = Date.now()
      const alertName = productName.replace(/ /g, "_") + '-' + timestamp

      const defaultAlertOptions = {
        "alert_type": "always",
        "alert.severity": "4",
        "alert.suppress": "0",
        "alert.track": "1",
        "dispatch.earliest_time": "-1h",
        "dispatch.latest_time": "now",
        "is_scheduled": "1",
        "cron_schedule": "* * * * *"
      };
      alertOptions = alertOptions ? alertOptions : defaultAlertOptions

      // Create the search query from the indicators
      let searchQuery = `index="_internal"`
      for (const indicator in indicators) {
        let indicatorRange = ''
        indicators[indicator].forEach((item: string) => {
          indicatorRange += `"${item}",`
        })
        indicatorRange = indicatorRange.slice(0, -1); 
        searchQuery += ` | search ${indicator.toLowerCase()} IN (${indicatorRange})`  
      }

      // Create a saved search as an alert.
      let alert = await this.service.savedSearches().create({
        name: alertName.substring(0,100), // Splunk only allows names < 100 char
        search: searchQuery,
        description: id,
        ...alertOptions
      });

      return {name: alert.name}
    
    } catch (err) {
      throw err
    }
  }

  async deleteAlert(alertName: string) {
    try {
      const name = alertName;
      // Retrieve the alert group.
      let firedAlertGroups = await this.service.savedSearches().fetch();
      // Get the alert group to delete using its name.
      let alertToDelete = firedAlertGroups.item(name);

      // Does the alert exist?
      if (!alertToDelete) {
          console.log("Can't delete '" + name + "' because it doesn't exist!");
      }
      else {
          // Delete the alert.
          await alertToDelete.remove();
          console.log("Deleted alert: " + name + "");
      }
    } catch (err) {
      console.log("Error:", err);
    }
  }
  
  async getSavedSearches() {
    try {
      let mySavedSearches = this.service.savedSearches();
      mySavedSearches = await mySavedSearches.fetch();
  
      console.log("There are " + mySavedSearches.list().length + " saved searches");
  
      let savedSearchColl = mySavedSearches.list();
  
      for(let i = 0; i < savedSearchColl.length; i++) {
          let search = savedSearchColl[i];
          console.log(i + ": " + search.name);
          console.log("    Query: " + search.properties().search + "\n");
      }
    } catch (err) {
      console.log("Error:", err);
    }
  }

  async createSavedSearch(productName: string, indicators: {}) {
    const timestamp = Date.now()
    const searchName = productName.replace(/ /g, "_") + '-' + timestamp

    // Retrieve the collection of saved searches
    let mySavedSearches = this.service.savedSearches();
    let searchQuery = `index="_internal"`
    for (const indicator in indicators) {
      let indicatorRange = ''

      indicators[indicator].forEach((item: string) => {
        indicatorRange += `"${item}",`
      })

      indicatorRange = indicatorRange.slice(0, -1); 
      searchQuery += ` | search ${indicator.toLowerCase()} IN (${indicatorRange})`  
    }

    // Create the saved search
    let newSearch = await mySavedSearches.create({name: searchName, search: searchQuery});
    
    return newSearch
  }

  // Run a saved search
  async runSearch(searchName: string) {
    // Retrieve the saved search collection
    let mySavedSearches = this.service.savedSearches();
    mySavedSearches = await mySavedSearches.fetch();

    // Retrieve the saved search 
    let mySavedSearch = mySavedSearches.item(searchName);

    // Run the saved search and poll for completion
    let [job, savedSearch] = await mySavedSearch.dispatch();

    // Display the job's search ID
    console.log("Job SID: ", job.sid);

    // Poll the status of the search job
    await job.track({
            period: 200
        }, {
            done: async function(job) {
                console.log("Done!");

                // Print out the statics
                console.log("Job statistics:");
                console.log("  Event count:  " + job.properties().eventCount);
                console.log("  Result count: " + job.properties().resultCount);
                console.log("  Disk usage:   " + job.properties().diskUsage + " bytes");
                console.log("  Priority:     " + job.properties().priority);

                // Get 10 results and print them
                let results;
                [results, job] = await job.results({
                    count: 10
                });
                console.log(JSON.stringify(results));
            },
            failed: function(job) {
                console.log("Job failed")
            },
            error: function(err) {
                console.log(err);
            }
        }
    );

    return job

  }
}
