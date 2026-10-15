<?php

namespace Tests\Feature;

use Tests\TestCase;

class AdminRouteTest extends TestCase
{
    public function test_admin_root_redirects_guests_to_login(): void
    {
        $response = $this->get('/admin');

        $response->assertRedirect('/admin/login');
    }
}
