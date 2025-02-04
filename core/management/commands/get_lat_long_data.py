from core.models.facility import Facility, Address
from geopy.geocoders import GoogleV3
geolocator = GoogleV3(api_key="AIzaSyD2Rq696ITlGYFmB7mny9EhH2Z86Xekw4o")

addresses_with_no_latlong = Address.objects.filter(latitude__isnull=True)
facility_num = 0
num_addresses = addresses_with_no_latlong.count()
for address in addresses_with_no_latlong:
    location = geolocator.geocode(f"{address.street} {address.zip}")

    address.latitude = location.latitude if location else None
    address.longitude = location.longitude if location else None
    address.save()

    # Print the data being processed
    #print(f"Processing Facility ID: {facility_id}, Latitude: {latitude}, Longitude: {longitude}")

    facility_num = facility_num + 1

    # Print after updating
    #print(f"Updated Facility ID: {facility_id} - New Latitude: {facility.address.latitude}, New Longitude: {facility.address.longitude}")

    percentage = round(100 * facility_num / num_addresses)
    if facility_num % 10 == 0:
        print(f"Current Lat/Long Percentage: {percentage}, {facility_num} / {num_addresses}")
    