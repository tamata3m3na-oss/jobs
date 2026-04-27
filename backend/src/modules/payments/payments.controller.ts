import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  RawBodyRequest,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async handleWebhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!sig) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    try {
      const event = await this.paymentsService.constructEventFromPayload(
        sig,
        req.rawBody,
      );

      this.logger.log(`Received stripe event: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          // Handle successful subscription
          this.logger.log(`Session completed: ${session.id}`);
          break;
        case 'customer.subscription.deleted':
          // Handle subscription cancellation
          break;
        default:
          this.logger.warn(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (err) {
      this.logger.error(`Webhook Error: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
  }
}
