<?php

namespace Tests\Feature;

use Illuminate\Routing\Router;
use Tests\TestCase;

class BookingPaymentRouteTest extends TestCase
{
    public function test_booking_gcash_payment_endpoint_is_registered(): void
    {
        $router = $this->app->make(Router::class);
        $route = $router->getRoutes()->getByName('booking.payment.gcash');

        $this->assertNotNull($route);
        $this->assertSame('booking/payment/gcash', $route->uri());
    }
}
