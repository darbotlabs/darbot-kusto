# Telemetry Frequently Asked Questions

# What is telemetry?

Microsoft Power Platform and Dynamics 365 products continuously emit telemetry about events that happen in the customer environment.
This telemetry can be useful for troubleshooting an issue or to gain insights into what is happening in the application.

## What does it cost?

Application Insights is billed based on the volume of telemetry data that your application sends. Currently, the first 5 GB of data per month is free. Regarding data retention, every GB of data ingested can be retained at no charge for up to first 90 days.

Please check the documentation <https://azure.microsoft.com/en-us/pricing/details/monitor/> for up-to-date information on pricing.

Azure monitor alerts are billed separately.

## How can I reduce cost?

To reduce ingestion cost, you can

* set limits on daily data ingestion
* reduce data ingestion by sampling to only ingest a percentage of the inbound data (see <https://docs.microsoft.com/en-us/azure/azure-monitor/app/sampling#ingestion-sampling>)
* set a daily limit of how much data that can be ingested
* purge data from your Application Insights resource (see _How do I delete data from Application Insights?_ below)
* set alerts on cost thresholds being exceeded to get notified if this happens
* use Data Collection Rules on Azure Log Analytics (the backend of Azure Application Insights)

## Where can I learn more about Kusto Query Language (KQL) and Azure Data Studio?

Please visit the [KQL README page](KQL/README.md) for learning resources on KQL and the [Trouble Shooting Guides README page](TroubleShootingGuides/README.md) for learning resources on Azure Data Studio.

## What is the data retention policy in Application Insights?

The default retention for Application Insights resources is 90 days. Different retention periods can be selected for each Application Insights resource. The full set of available retention periods is 30, 60, 90, 120, 180, 270, 365, 550 or 730 days.

See <https://docs.microsoft.com/en-us/azure/azure-monitor/app/pricing#change-the-data-retention-period>

## How do I delete data from Application Insights?

Purge data in an Application Insights component by a set of user-defined filters.

See <https://docs.microsoft.com/en-us/rest/api/application-insights/components/purge#examples>

You can use Powershell to setup a purge process, see an example here: [How do I use Powershell to delete telemetry data?](Powershell/README.md)

## Can I grant read-only access to Application Insights?

To grant a person read-only access to Application Insights, go to the Access control (IAM) page in the Application Insights portal, and then add the role assignment "Reader" to the person.

You might also need to add the role assignment "Reader" to the person on the Resource Group for the Application Insights subscription.

## What about Privacy regulations such as GDPR?

The Microsoft products do not emit any End User Identifiable Information (EUII) to Application Insights. So the telemetry is born GDPR compliant. The service only emits data that is classified as either System Metadata or Organization Identifiable Information (OII). The meaning of these classifications are described here: [DataClassification Option Type](https://docs.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/methods-auto/dataclassification/dataclassification-option)
