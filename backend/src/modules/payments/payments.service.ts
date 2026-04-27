import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('stripe.apiKey');
    this.stripe = new Stripe(apiKey || '', {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckoutSession(priceId: string, customerId: string) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        customer: customerId,
        success_url: `${this.configService.get('frontendUrl')}/dashboard/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${this.configService.get('frontendUrl')}/dashboard/payment/cancel`,
      });
      return session;
    } catch (error) {
      this.logger.error(`Error creating checkout session: ${error.message}`);
      throw error;
    }
  }

  async constructEventFromPayload(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>('stripe.webhookSecret');
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret || '');
  }
}
